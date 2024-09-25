interface ICredentials {
    username: string;
    email: string;
    password: string;
};
export interface ILoginCredentials extends ICredentials { };

export interface IRegisterCredentials extends ICredentials {
    fullName: string;
};