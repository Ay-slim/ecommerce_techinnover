export type UserAuthDto = {
  name: string;
  email: string;
  banned: boolean;
  role: string;
  _id: string;
  expiry: string;
};

export type LoginUserDto = {
  email: string;
  password: string;
};

export type RegisterUserDto = {
  name: string;
} & LoginUserDto;

export type AuthTokenDto = {
  name: string;
  email: string;
  _id: string;
  banned: boolean;
  role: string;
};
