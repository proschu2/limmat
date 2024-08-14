import {onCall, CallableRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import fetch = require("node-fetch");
const createProxyFunction = (apiUrl: string) => {
  return onCall(async (request: CallableRequest<any>) => {
    try {
      const fetchOptions: any = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any other headers you need
        },
      };
      /* if (
          request.body &&
          request.method !== "GET" &&
          request.method !== "HEAD"
        ) {
          fetchOptions.body = JSON.stringify(request.body);
        } */
      const apiResponse = await fetch(apiUrl, fetchOptions);
      const responseData = await apiResponse.json();
      return responseData;
    } catch (error) {
      logger.error("Error making API request", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
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
