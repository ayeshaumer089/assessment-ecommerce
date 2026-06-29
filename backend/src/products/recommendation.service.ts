import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

/**
 * Recommendation algorithm — content-based scoring
 *
 * Two signals are combined into a score (max 100 pts):
 *
 * ① Category match (+40 pts)
 *   Products in the same category are the strongest signal of relevance.
 *
 * ② Price band proximity (+0–40 pts)
 *   Measures how close the candidate price is to the source price,
 *   expressed as a percentage difference:
 *     ≤ 10 %  → +40 pts  (nearly the same price point)
 *     ≤ 25 %  → +25 pts  (similar price range)
 *     ≤ 50 %  → +10 pts  (loosely related)
 *      > 50 %  →  +0 pts  (too cheap or too expensive)
 *
 * ③ In-stock bonus (+20 pts)
 *   Out-of-stock products are not removed outright, but they score lower
 *   and are pushed below in-stock alternatives.
 *
 * Minimum threshold: 40 pts
 *   A candidate must satisfy at least one strong signal (category match OR
 *   very similar price) to qualify. Products with score < 40 are discarded.
 *
 * Scoring is computed entirely inside a MongoDB aggregation pipeline —
 * no application-layer sorting loop.
 */

const SCORE = {
  CATEGORY: 40,
  PRICE_EXACT: 40, // ± 10 %
  PRICE_CLOSE: 25, // ± 25 %
  PRICE_NEAR: 10,  // ± 50 %
  IN_STOCK: 20,
  MIN: 40,
} as const;

@Injectable()
export class RecommendationService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getRecommendations(
    source: ProductDocument,
    limit = 6,
  ): Promise<ProductDocument[]> {
    const sourceId = source._id as Types.ObjectId;
    const { category, price } = source;

    return this.productModel.aggregate([
      // ── Step 1: exclude the source product ───────────────────────────────────
      { $match: { _id: { $ne: sourceId } } },

      // ── Step 2: compute scoring signals ──────────────────────────────────────
      {
        $addFields: {
          _categoryScore: {
            $cond: [{ $eq: ['$category', category] }, SCORE.CATEGORY, 0],
          },
          _priceScore: {
            $let: {
              vars: {
                // Normalised absolute price difference (0 = identical price)
                pricePct: {
                  $cond: [
                    { $eq: [price, 0] },
                    0,
                    {
                      $abs: {
                        $divide: [{ $subtract: ['$price', price] }, price],
                      },
                    },
                  ],
                },
              },
              in: {
                $switch: {
                  branches: [
                    { case: { $lte: ['$$pricePct', 0.10] }, then: SCORE.PRICE_EXACT },
                    { case: { $lte: ['$$pricePct', 0.25] }, then: SCORE.PRICE_CLOSE },
                    { case: { $lte: ['$$pricePct', 0.50] }, then: SCORE.PRICE_NEAR },
                  ],
                  default: 0,
                },
              },
            },
          },
          _stockScore: {
            $cond: [{ $gt: ['$stock', 0] }, SCORE.IN_STOCK, 0],
          },
        },
      },

      // ── Step 3: sum the signals into a total score ────────────────────────────
      {
        $addFields: {
          _score: { $add: ['$_categoryScore', '$_priceScore', '$_stockScore'] },
        },
      },

      // ── Step 4: enforce minimum relevance threshold ────────────────────────────
      { $match: { _score: { $gte: SCORE.MIN } } },

      // ── Step 5: best matches first, newest as tiebreaker ──────────────────────
      { $sort: { _score: -1, createdAt: -1 } },

      { $limit: limit },

      // ── Step 6: strip internal scoring fields from the response ───────────────
      {
        $project: {
          _categoryScore: 0,
          _priceScore: 0,
          _stockScore: 0,
          _score: 0,
        },
      },
    ]);
  }
}
