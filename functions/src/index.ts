import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import cors from "cors";
const corsHandler = cors({origin: true});
import fetch = require("node-fetch");
const createProxyFunction = (apiUrl: string) => {
  return onRequest((request, response) => {
    corsHandler(request, response, async () => {
      try {
        const fetchOptions: any = {
          method: request.method,
          headers: {
            "Content-Type": "application/json",
            // Add any other headers you need
          },
        };
        if (
          request.body &&
          request.method !== "GET" &&
          request.method !== "HEAD"
        ) {
          fetchOptions.body = JSON.stringify(request.body);
        }
        const apiResponse = await fetch(apiUrl, fetchOptions);

        const data = await apiResponse.json();
        response.status(apiResponse.status).send(data);
      } catch (error) {
        logger.error("Error making API request", error);
        response.status(500).send((error as Error).toString());
      }
    });
  });
};

export const waterHeightRequest = createProxyFunction(
  "https://www.hydrodaten.admin.ch/plots/p_forecast/2099_p_forecast_de.json"
);
export const waterSpeedRequest = createProxyFunction(
  "https://www.hydrodaten.admin.ch/plots/q_forecast/2099_q_forecast_de.json"
);
export const waterStatusRequest = createProxyFunction(
  "https://www.hydrodaten.admin.ch/plots/p_q_7days/2099_p_q_7days_en.json"
);
export const waterTemperatureRequest = createProxyFunction(
  "https://www.hydrodaten.admin.ch/plots/temperature_7days/2243_temperature_7days_en.json"
);
export const weatherForecastRequest = createProxyFunction(
  "https://api.open-meteo.com/v1/forecast?latitude=47.392574&longitude=8.520825&current=temperature_2m,weather_code&daily=weather_code"
);
