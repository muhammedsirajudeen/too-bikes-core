import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { Vehicle } from "../route";
import { IFAQ } from "@/core/interface/model/IFaq.model";
import { FaqService } from "@/services/shared/faq.service";
import { AvailableVehiclesService } from "@/services/client/available-vehicles.service";

export interface VehicleResponse {
  success: boolean;
  message: string;
  data: {
    vehicle: Vehicle;
    FAQ: IFAQ[];
  };
}

const faqService = new FaqService();    
const availableVehiclesService = new AvailableVehiclesService();

// GET /availableVehicle/[id]
export const GET = withLoggingAndErrorHandling(
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').pop();

    const faqs = await faqService.getAllFaqs();
    const vehicle = await availableVehiclesService.findVehicleById(id!);

    return NextResponse.json({
      success: true,
      message: "Available vehicle retrieved successfully",
      data: {
        vehicle: vehicle,
        FAQ: faqs
      }
    }, { status: HttpStatus.OK });
  }
);
