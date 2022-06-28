import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { createContext, ReactNode, useEffect, useState } from 'react';

import { api } from '../services/apiClient';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (creadentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut(broadcast: boolean = true) {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");

  // authChannel.postMessage("signOut");

  if (broadcast) authChannel.postMessage("signOut");

  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    // BroadCast vai no useEffect no nextjs, pois o useeffect não roda do lado do servidor, e o broadcastchannel precisa rodar somente do lado do client
    authChannel = new BroadcastChannel("auth");

    authChannel.onmessage = (message) => {
      // console.log(message);
      switch (message.data) {
        case "signOut":
          signOut(false);
          break;
        // case "signIn":
        //   signIn( false);
        //   break;
        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          // console.log(response);
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    // console.log({ email, password });
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      // sessionStorage
      // localStorage   --- Muito difícil de usar no NextJS
      // cookies

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days para o token expirar. Pois não é função do front analisar isso
        path: "/", // qualquer endereço pode ter acesso a essa informação
      });
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers["Authorization"] = `Bearer ${token}`; // serve para colocar o token no header da requisição antes da requisição lá no "api.ts"

      Router.push("/dashboard");

      // if (broadcast) authChannel.postMessage('signOut');

      // console.log(response.data);
      // console.log(user);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
