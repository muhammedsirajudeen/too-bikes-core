  import { Document, Model, Types, UpdateQuery } from "mongoose";
//   import { IBaseRepository } from "../core/interface/repositories/IBase.repository";

  export abstract class BaseRepository<T extends Document>
    // implements IBaseRepository<T>
  {
    constructor(protected model: Model<T>) {}

    async findById(id: Types.ObjectId): Promise<T | null> {
      return this.model.findById(id);
    }

    async create(data: Partial<T>): Promise<T> {
      const doc = new this.model(data);
      await doc.save();
      return doc;
    }

    async findAll(filter: Record<string,unknown> = {}): Promise<T[]> {
      return this.model.find(filter);
    }

    async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
      return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async findOne(filter: Record<string,unknown>): Promise<T | null> {
      return this.model.findOne(filter);
    }

    async deleteOne(filter: Record<string,unknown>): Promise<void> {
      await this.model.deleteOne(filter);
    }

    async countDocuments(filter: Record<string,unknown> = {}): Promise<number> {
      return this.model.countDocuments(filter);
    }
  }
