import { fetchAPI } from "./api.config";
import { mapUsuarioToFrontend } from "./mappers";
import { Usuario } from "@/types";

export const authService = {
  login: (data: any): Promise<{ access_token: string }> => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: (): Promise<Usuario> => fetchAPI('/auth/me').then(mapUsuarioToFrontend),
};
