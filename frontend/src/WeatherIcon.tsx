import React from 'react';
import {
    WiDaySunny,
    WiDayCloudy,
    WiDayRain,
    WiDayShowers,
    WiDayHaze,
    WiDayThunderstorm,
    WiNightClear,
    WiNightAltCloudy,
    WiNightAltRain,
    WiNightAltShowers,
    WiNightAltThunderstorm,
    WiCloud,
    WiCloudy,
    WiRain,
    WiShowers,
    WiThunderstorm,
    WiFog,
    WiSnow,
    WiSleet,
    WiNa
} from 'react-icons/wi';

const iconMap: { [key: string]: React.ElementType } = {
    'wi-day-sunny': WiDaySunny,
    'wi-day-cloudy': WiDayCloudy,
    'wi-day-rain': WiDayRain,
    'wi-day-showers': WiDayShowers,
    'wi-day-haze': WiDayHaze,
    'wi-day-thunderstorm': WiDayThunderstorm,
    'wi-night-clear': WiNightClear,
    'wi-night-alt-cloudy': WiNightAltCloudy,
    'wi-night-alt-rain': WiNightAltRain,
    'wi-night-alt-showers': WiNightAltShowers,
    'wi-night-alt-thunderstorm': WiNightAltThunderstorm,
    'wi-cloud': WiCloud,
    'wi-cloudy': WiCloudy,
    'wi-rain': WiRain,
    'wi-showers': WiShowers,
    'wi-thunderstorm': WiThunderstorm,
    'wi-fog': WiFog,
    'wi-snow': WiSnow,
    'wi-sleet': WiSleet,
};

export const WeatherIcon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className }) => {
    const IconComponent = iconMap[iconName] || WiNa;
    return <IconComponent className={className} />;
};