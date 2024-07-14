import axios from 'axios';
import { API_KEY } from '../constants/index';

const forecastEndpoint = params =>`http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${params.city}&days=${params.days}&aqi=no&alerts=no`;
const locationsEndpoint = params =>`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${params.city}`;

const ApiCall = async (endpoint) => {
    const options = {
        method : 'GET',
        url : endpoint
    }
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const fetchForecast = params => {
    return ApiCall(forecastEndpoint(params));
}

export const fetchLocations = params => {
    return ApiCall(locationsEndpoint(params));
}