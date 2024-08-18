import {
  onCall,
  CallableRequest,
  HttpsError,
} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import fetch = require("node-fetch");
import {FieldValue} from "firebase-admin/firestore";

admin.initializeApp();

const db = admin.firestore();

const getData = async (url: string) => {
  try {
    const fetchOptions: any = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any other headers you need
      },
    };
    const apiResponse = await fetch(url, fetchOptions);
    const responseData = await apiResponse.json();
    return responseData;
  } catch (error) {
    logger.error("Error making API request", error);
    throw new HttpsError("internal", "Error making API request");
  }
};
const averageValuesByDate = (
  dates: string[],
  values: number[],
  round = true
): { [key: string]: number } => {
  const dateToValuesMap: { [key: string]: [number, number] } = {};

  dates.forEach((date, i) => {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const value = values[i];
    if (!dateToValuesMap[formattedDate]) {
      dateToValuesMap[formattedDate] = [value, 1];
    } else {
      dateToValuesMap[formattedDate][0] += value;
      dateToValuesMap[formattedDate][1] += 1;
    }
  });

  const averageValues: { [key: string]: number } = {};
  Object.entries(dateToValuesMap).forEach(([date, [sum, count]]) => {
    averageValues[date] = round ?
      Math.round(sum / count) :
      Math.round((sum / count) * 100) / 100;
  });

  return Object.keys(averageValues)
    .sort()
    .reduce((acc, date) => {
      acc[date] = averageValues[date];
      return acc;
    }, {} as { [key: string]: number });
};
// single dataset functions
const fetchWaterHeight = async () => {
  const response = await getData(
    "https://www.hydrodaten.admin.ch/plots/p_forecast/2099_p_forecast_de.json"
  );
  const data = response["plot"]["data"];
  const correctLists = data.find(
    (element: any) => element["name"] === "Median"
  );
  const dates: string[] = correctLists["x"];
  const values: number[] = correctLists["y"].map(
    (item: any) => parseFloat(item) - 400.35
  );
  const averages: { [key: string]: number } = averageValuesByDate(
    dates,
    values,
    false
  );
  return averages;
};

const fetchWaterSpeed = async (): Promise<{ [key: string]: number }> => {
  const response = await getData(
    "https://www.hydrodaten.admin.ch/plots/q_forecast/2099_q_forecast_de.json"
  );
  const data = response["plot"]["data"];
  const correctLists = data.find(
    (element: any) => element["name"] === "Median"
  );
  const dates: string[] = correctLists["x"];
  const values: number[] = correctLists["y"].map((item: any) =>
    parseFloat(item)
  );
  const averages: { [key: string]: number } = averageValuesByDate(
    dates,
    values,
    true
  );
  return averages;
};

const fetchWaterStatus = async (): Promise<{
  waterHeight: number;
  waterSpeed: number;
}> => {
  const response = await getData(
    "https://www.hydrodaten.admin.ch/plots/p_q_7days/2099_p_q_7days_en.json"
  );
  const data = response["plot"]["data"];

  const waterSpeedData = data.find(
    (element: any) => element["name"] === "Discharge"
  );
  const waterSpeedValues: number[] = waterSpeedData["y"].map((item: any) =>
    Math.round(parseFloat(item))
  );
  const waterSpeed = waterSpeedValues[waterSpeedValues.length - 1];

  const waterHeightData = data.find(
    (element: any) => element["name"] === "Water level"
  );
  const waterHeightValues: number[] = waterHeightData["y"].map(
    (item: any) => Math.round((parseFloat(item) - 400.35) * 100) / 100
  );
  const waterHeight = waterHeightValues[waterHeightValues.length - 1];

  return {waterHeight, waterSpeed};
};
const fetchWaterTemperature = async (): Promise<number> => {
  const response = await getData(
    "https://www.hydrodaten.admin.ch/plots/temperature_7days/2243_temperature_7days_en.json"
  );
  const data = response["plot"]["data"];
  return parseFloat(data[0]["y"].slice(-1)[0].toFixed(1));
};

const fetchWaterData = async (): Promise<{
  waterHeight: number;
  waterSpeed: number;
  waterTemperature: number;
  weatherCode: number;
  outsideTemperature: number;
}> => {
  const waterStatus = await fetchWaterStatus();
  const waterTemperature = await fetchWaterTemperature();

  const weatherResponse = await getData(
    "https://api.open-meteo.com/v1/forecast?latitude=47.392574&longitude=8.520825&current=temperature_2m,weather_code&daily=weather_code"
  );
  const currentTemperature = weatherResponse["current"]["temperature_2m"];
  const currentWeatherCode = weatherResponse["current"]["weather_code"];

  return {
    waterHeight: waterStatus.waterHeight,
    waterSpeed: waterStatus.waterSpeed,
    waterTemperature,
    weatherCode: currentWeatherCode,
    outsideTemperature: currentTemperature,
  };
};
/*
const fetchHistoricalWaterData = async (): Promise<{ [key: string]: any }> => {
  const waterHeight = await fetchWaterHeight();
  const waterSpeed = await fetchWaterSpeed();
  const waterTemperature = await fetchWaterTemperature();

  const waterData: { [key: string]: any } = {};

  Object.keys(waterHeight).forEach((date, i) => {
    waterData[date] = {
      waterHeight: waterHeight[date],
      waterSpeed: waterSpeed[date],
      waterTemperature: waterTemperature,
    };
  });

  return waterData;
}; */

const fetchWeatherForecastData = async (): Promise<{
  [key: string]: number;
}> => {
  const response = await getData(
    "https://api.open-meteo.com/v1/forecast?latitude=47.392574&longitude=8.520825&current=temperature_2m,weather_code&daily=weather_code"
  );
  const forecasts = response["daily"];
  const dates: string[] = forecasts["time"];
  const weatherCodes: number[] = forecasts["weather_code"];
  const weatherForecastData: { [key: string]: number } = {};

  dates.forEach((date, i) => {
    weatherForecastData[date] = weatherCodes[i];
  });
  return weatherForecastData;
};

const fetchForecastedWaterData = async (): Promise<{ [key: string]: any }> => {
  const waterHeight = await fetchWaterHeight();
  const waterSpeed = await fetchWaterSpeed();
  const waterTemperature = await fetchWaterTemperature();
  const weatherCodes = await fetchWeatherForecastData();

  const forecastData: { [key: string]: any } = {};

  Object.keys(waterHeight).forEach((date, i) => {
    forecastData[date] = {
      waterHeight: waterHeight[date],
      waterSpeed: waterSpeed[date],
      waterTemperature: waterTemperature,
      weatherCode: weatherCodes[date] || null,
    };
  });

  return forecastData;
};

const manageFirestoreData = async (collection: string) => {
  const docRef = db.collection(collection).doc("latest");
  const doc = await docRef.get();
  const thirtyMinutesAgo = new Date(new Date().getTime() - 30 * 60 * 1000);
  if (doc.exists) {
    const docData = doc.data();
    if (docData) {
      const updatedAt = docData.updatedAt ? docData.updatedAt.toDate() : null;
      if (updatedAt && updatedAt > thirtyMinutesAgo) {
        logger.info("Data is up to date, skipping Firestore update");
        // we need to remove the updatedAt field from the response
        delete docData.updatedAt;
        // order the keys
        const orderedData: { [key: string]: any } = {};
        Object.keys(docData)
          .sort()
          .forEach((key) => {
            orderedData[key] = docData[key];
          });
        return orderedData;
      }
    }
  }
  logger.info("Data is outdated, updating Firestore");
  switch (collection) {
  case "forecastedWaterData": {
    const data = await fetchForecastedWaterData();
    await docRef.set({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return data;
  }
  case "waterData": {
    const data = await fetchWaterData();
    await docRef.set({...data, updatedAt: FieldValue.serverTimestamp()});
    return data;
  }
  }
  return new Error("Invalid collection name");
};

export const getForecastedWaterData = onCall(async (data: CallableRequest) => {
  return manageFirestoreData("forecastedWaterData");
});

export const getWaterData = onCall(async (data: CallableRequest) => {
  return manageFirestoreData("waterData");
});
