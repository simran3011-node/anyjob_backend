interface ICredentials {
    email: string;
    password: string;
};
export interface ILoginCredentials extends ICredentials { };

export interface IRegisterCredentials extends ICredentials {
    firstName: string;
    lastName: string;
    userType:string;
};