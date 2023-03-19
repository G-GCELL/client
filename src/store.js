import { reactive } from 'vue'
import { useCookies } from "vue3-cookies";

export const progressStore = reactive(new Map());

const { cookies } = useCookies();

export const getToken = () => {
    return cookies.get("token");
};

export const getRoles = () => {
    const token = getToken();
    let base64Payload = token.split(".")[1];
    let decodePayload = atob(base64Payload);
    let payload = JSON.parse(decodePayload);
    return payload.roles.split(",");
}

export const completeStore = reactive(new Set());

export const setComplete = (value) => {
    completeStore.add(value);
}

export const isComplete = (value) => {
    return completeStore.has(value);
}