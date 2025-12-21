/// <reference types="@sveltejs/kit" />

declare module "leaflet";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        createOrder?: (data: any, actions: any) => Promise<string> | string;
        onApprove?: (data: any, actions: any) => Promise<void> | void;
        onError?: (err: any) => void;
        onCancel?: (data: any) => void;
      }) => {
        render: (container: string | HTMLElement) => void;
      };
    };
  }
}

export {};
