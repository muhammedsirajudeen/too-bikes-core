import { AvailableVehiclesController } from "@/controller/client/available-vehicles.controller";
import { Router } from "express";

const router = Router();

const controller = new AvailableVehiclesController();

router.get("/", controller.findAvailableVehicles.bind(controller));

export default router;
