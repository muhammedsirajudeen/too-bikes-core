import { HttpStatus } from "@/constants/status.constant";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { NextRequest, NextResponse } from "next/server";
import { IFAQ } from "@/core/interface/model/IFaq.model";
import { FaqService } from "@/services/shared/faq.service";
import { AvailableVehiclesService } from "@/services/server/available-vehicles.service";
import { IVehicle } from "@/core/interface/model/IVehicle.model";
import { generateSignedUrl } from "@/utils/s3Storage.utils";

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

    // Generate signed URLs for images
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vehicleObj: any = (vehicle as any).toObject ? (vehicle as any).toObject() : vehicle;
    
    if (vehicleObj && vehicleObj.image) {
        const images = await Promise.all((vehicleObj.image || []).map(async (key: string) => {
            try {
                const url = await generateSignedUrl(key);
                return { key, url };
            } catch (error) {
                console.error(`Failed to sign URL for key ${key}:`, error);
                return { key, url: null };
            }
        }));
        vehicleObj.image = images;
    }

    return NextResponse.json({
      success: true,
      message: "Available vehicle retrieved successfully",
      data: {
        vehicle: vehicleObj,
        FAQ: faqs
      }
    }, { status: HttpStatus.OK });
  }
);
