import {
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Image
} from "react-native";
import react, { useEffect, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme";
import { MagnifyingGlassIcon, MapPinIcon, CalendarDaysIcon } from "react-native-heroicons/outline";
import { debounce } from "lodash";
import { fetchLocations, fetchForecast } from "../api/weather";
import * as Progress from 'react-native-progress';
import { storeData, getData } from "../utils/AsyncStorage";

export default function HomeScreen() {
    const [ShowSearch, ToogleSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleLocation = (loc) => {
        console.log(loc);
        setLocations([]);
        setLoading(true);
        ToogleSearch(false);
        fetchForecast({
            city: loc.name,
            days: "7"
        }).then(data => {
            setWeather(data);
            storeData("location", loc.name);
            setLoading(false);
            console.log(data);
        });
    }

    const HandleSearch = (text) => {
        fetchLocations({ city: text }).then((data) => {
            if (data) {
                setLocations(data);
            }
        });
    }

    useEffect(() => {
        fetchMyLocation();
    }, []);

    const fetchMyLocation = async () => {
        let myCity = await getData("location");
        let cityName = "Santiago";

        if (myCity) {
            cityName = myCity;
        }

        fetchForecast({
            city: cityName,
            days: "7"
        }).then(data => {
            setWeather(data);
            setLoading(false);
            console.log(data);
        });
    }

    const HandleTextDebounce = useCallback(debounce(HandleSearch, 800), []);

    const { current, location } = weather;
    //console.log(current?.condition?.text);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? "padding" : null}
            style={{ flex: 1 }}
        >
            <View className="flex-1 relative">
                <StatusBar style="light" />
                <Image
                    blurRadius={70}
                    source={require("../assets/images/bg.png")}
                    className="absolute h-full w-full"
                />
                {
                    loading ? (
                        <View className="flex-1 flex-row justify-center items-center">
                            <Progress.CircleSnail color={theme.bgWhite(0.5)} size={100} />
                        </View>
                    ) : (
                        <SafeAreaView className="flex flex-1">
                            {/* Search section */}
                            <View style={{ height: "7%" }} className="mx-4 relative z-50 mt-12">
                                <View
                                    className="flex-row justify-end items-center rounded-full"
                                    style={{ backgroundColor: ShowSearch ? theme.bgWhite(0.2) : "transparent" }}
                                >
                                    {
                                        ShowSearch ? (
                                            <TextInput
                                                onChangeText={HandleTextDebounce}
                                                placeholder="Busca una ciudad"
                                                placeholderTextColor={"lightgray"}
                                                className="pl-6 h-15 pb-1 flex-1 text-lg text-white"
                                            />
                                        ) : null
                                    }
                                    <TouchableOpacity
                                        onPress={() => ToogleSearch(!ShowSearch)}
                                        style={{ backgroundColor: theme.bgWhite(0.3) }}
                                        className="rounded-full p-3 m-1"
                                    >
                                        <MagnifyingGlassIcon size="25" color="white" />
                                    </TouchableOpacity>
                                </View>
                                {
                                    locations.length > 0 && ShowSearch ? (
                                        <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                                            {
                                                locations.map((loc, index) => {
                                                    let ShowBorder = index + 1 != locations.length;
                                                    let BorderClass = ShowBorder ? "border-b-2 border-b-gray-400" : "";
                                                    return (
                                                        <TouchableOpacity
                                                            onPress={() => handleLocation(loc)}
                                                            key={index}
                                                            className={"flex-row items-center border-0 p-3 px-4 mb-1" + BorderClass}
                                                        >
                                                            <MapPinIcon size="20" color="gray" />
                                                            <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                })
                                            }
                                        </View>
                                    ) : null
                                }
                            </View>
                            {/* Forecast section */}
                            {!keyboardVisible && (
                                <View className="mx-4 flex justify-around flex-1 mb-2 mt-2">
                                    <Text className="text-white text-center text-2xl font-bold">
                                        {location?.name},
                                        <Text className="text-lg font-semibold text-gray-300">
                                            {location?.country}
                                        </Text>
                                    </Text>

                                    <View className="flex-row justify-center">
                                        <Image
                                            //source={require("../assets/images/partlycloudy.png")}
                                            source={{ uri: "https://" + current?.condition?.icon }}
                                            className="w-52 h-52"
                                        />
                                    </View>

                                    <View className="space-y-2">
                                        <Text className="text-center font-bold text-white text-6xl ml-5">
                                            {Math.max(Math.round(current?.temp_c || 0), 0)}&#176;
                                        </Text>
                                        <Text className="text-center text-white text-xl ml-5 tracking-widest">
                                            {current?.condition?.text}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between mx-4">
                                        <View className="flex-row space-x-2 items-center">
                                            <Image
                                                source={require("../assets/icons/wind.png")}
                                                className="w-6 h-6"
                                            />
                                            <Text className="text-white text-lg">
                                                {current?.wind_kph} km/h
                                            </Text>
                                        </View>
                                        <View className="flex-row space-x-2 items-center">
                                            <Image
                                                source={require("../assets/icons/drop.png")}
                                                className="w-6 h-6"
                                            />
                                            <Text className="text-white text-lg">
                                                {current?.humidity}%
                                            </Text>
                                        </View>
                                        <View className="flex-row space-x-2 items-center">
                                            <Image
                                                source={require("../assets/icons/sun.png")}
                                                className="w-6 h-6"
                                            />
                                            <Text className="text-white text-lg">
                                                {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            {!keyboardVisible && (
                                <View className="mb-4 space-y-3">
                                    <View className="flex-row items-center mx-5 space-x-2">
                                        <CalendarDaysIcon size="22" color="white" />
                                        <Text className="text-white text-base">
                                            Siguientes Dias
                                        </Text>
                                    </View>

                                    <ScrollView
                                        horizontal
                                        contentContainerStyle={{ paddingHorizontal: 15 }}
                                        showHorizontalScrollIndicator={false}
                                    >
                                        {
                                            weather?.forecast?.forecastday?.map((item, index) => {
                                                let date = new Date(item.date);
                                                let options = { weekday: "long" };
                                                let dayName = new Intl.DateTimeFormat("es-CL", options).format(date);
                                                dayName = dayName.split(',')[0];
                                                return (
                                                    <View
                                                        key={index}
                                                        className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                                                        style={{ backgroundColor: theme.bgWhite(0.15) }}
                                                    >
                                                        <Image source={{ uri: "https://" + item?.day?.condition?.icon }}
                                                            className="w-11 h-11"
                                                        />
                                                        <Text className="text-white">{dayName}</Text>
                                                        <Text className="text-white text-xl font-semibold">
                                                            {Math.abs(Math.round(item?.day?.avgtemp_c || 0)) < 1 ? 0 : Math.round(item?.day?.avgtemp_c)}&#176;
                                                        </Text>
                                                    </View>
                                                )
                                            })
                                        }
                                    </ScrollView>
                                </View>
                            )}
                        </SafeAreaView>
                    )
                }
            </View>
        </KeyboardAvoidingView>
    );
}
