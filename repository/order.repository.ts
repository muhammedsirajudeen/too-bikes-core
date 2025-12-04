import { IOrder } from "../core/interface/model/IOrder.model";
import { BaseRepository } from "./base.respository";
import { OrderModel } from "@/model/orders.model";

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(OrderModel);
  }
}
