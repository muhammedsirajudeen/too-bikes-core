import { IFAQ } from "@/core/interface/model/IFaq.model";
import { BaseRepository } from "./base.respository";
import { FAQModel } from "@/model/faq.model";

export class FAQRepository extends BaseRepository<IFAQ> {
  constructor() {
    super(FAQModel);
  }
}
