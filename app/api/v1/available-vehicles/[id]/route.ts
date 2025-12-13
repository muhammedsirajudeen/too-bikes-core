import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { IFAQ } from "@/core/interface/model/IFaq.model";
import { FaqService } from "@/services/shared/faq.service";
import { AvailableVehiclesService } from "@/services/server/available-vehicles.service";
import { IVehicle } from "@/core/interface/model/IVehicle.model";

export interface VehicleDetailResponse {
  success: boolean;
  message: string;
  data: {
    vehicle: IVehicle;
    FAQ: IFAQ[];
  };
  error?: Array<{ message?: string; path?: string[] }>;
}

const faqService = new FaqService();
const availableVehiclesService = new AvailableVehiclesService();

// GET /availableVehicle/[id]
export const GET = withLoggingAndErrorHandling(
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Vehicle ID is required",
      }, { status: HttpStatus.BAD_REQUEST });
    }

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
