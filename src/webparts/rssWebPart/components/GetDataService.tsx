import { SPHttpClient, IHttpClientOptions, HttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { IXmlList, IRssWebPartProps } from './IRssWebPartProps';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IGetDataService {
    getData(): Promise<any>;
}

export class SPDataService implements IGetDataService {

    private _httpC: HttpClient;
    private _absUrl: string;

    constructor(httpClient: HttpClient, url: string) {
        this._httpC = httpClient;
        this._absUrl = url;
    }

    public async getData(): Promise<any> {

        var pro = new Promise<string>(async (resolve, reject) => {
            let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            let requestHeaders = new Headers();            

            const requestGetOptions: IHttpClientOptions = {
                method: "GET",
                headers: requestHeaders,
                mode: "cors"
            };

            return this._httpC.fetch(
                proxyUrl + this._absUrl,
                HttpClient.configurations.v1,
                requestGetOptions)
                .then((response: HttpClientResponse): Promise<any> => {
                    if (response.ok) {
                        return response.text().then((str) => {
                            // console.log(str);
                            let responseDoc = new DOMParser().parseFromString(str, 'text/xml');
                            return responseDoc;
                        });                        
                    } else {
                        throw new Error('Network response was not ok.');
                    }
                })
                .then((data: any): void => {
                    console.log("data: ", data);
                    resolve(data);                    
                })
                .catch(error => {
                    reject(error);
                });
        });
        return pro;
    }
}

