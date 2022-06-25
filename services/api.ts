import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();
let isRefreshing: boolean = false;
let failedRequestsQueue = [];

interface AxiosErrorResponse {
  code?: string;
}

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<AxiosErrorResponse>) => {
    // console.log(error.response.status)
    // console.log(error.response)
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        // renovar o token, ou seja, RefreshTOken
        cookies = parseCookies(); //atualizar os cookies sempre que fizer algo

        const { "nextauth.refreshToken": refreshToken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", {
              refreshToken,
            })
            .then(response => {
              const { token } = response.data;

              setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days para o token expirar. Pois não é função do front analisar isso
                path: "/", // qualquer endereço pode ter acesso a essa informação
              });
              setCookie(
                undefined,
                "nextauth.refreshtoken",
                response.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                }
              );

              api.defaults.headers["Authorization"] = `Bearer ${token}`; // serve para colocar o token no header da requisição antes da requisição lá no "api.ts"

              failedRequestsQueue.forEach( request => request.onSuccess(token))
              failedRequestsQueue = [];
            }).catch(err => {
              failedRequestsQueue.forEach( request => request.onFailure(err))
              failedRequestsQueue = [];
            }).finally(() => {
              isRefreshing = false
            })
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      } else {
        // deslogar o usuario, pois foi um error 401 mas não foi do tipo 'token.expired'
      }
    }
  }
);
