import { FAQRepository } from "@/repository/faq.repository";

export class FaqService {
  constructor(
    private readonly faqRepo = new FAQRepository(),
  ) {}

  async getAllFaqs() {
    return this.faqRepo.findAll();
  }

}
