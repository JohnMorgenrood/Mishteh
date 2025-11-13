declare module '@paypal/checkout-server-sdk' {
  export namespace core {
    export class PayPalHttpClient {
      constructor(environment: any);
      execute(request: any): Promise<any>;
    }

    export class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    export class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
  }

  export namespace orders {
    export class OrdersCreateRequest {
      prefer(preference: string): void;
      requestBody(body: any): void;
    }

    export class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: any): void;
    }

    export class OrdersGetRequest {
      constructor(orderId: string);
    }
  }
}
