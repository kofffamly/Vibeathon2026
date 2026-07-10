# Connect Frontend to Backend API

The frontend is currently using simulated API calls and mocked data (`mockData.ts`). The goal is to connect it to the Express backend running on `http://localhost:3000`.

## User Review Required

> [!WARNING]
> By replacing the mock data with actual API calls, the frontend will rely completely on the backend being active. If you are running the app on a physical device or an Android emulator, `localhost` might not resolve correctly. You may need to change the `API_BASE_URL` to your machine's local IP address (e.g., `http://192.168.X.X:3000`) instead of `localhost`. 
>
> Please confirm if using `http://localhost:3000` is sufficient, or if we should use a configurable constant for the API URL that can be easily changed later.

## Proposed Changes

### Configuration & Utilities

#### [NEW] `frontend/api/client.ts`
Create a centralized API client that wraps the native `fetch` API. It will automatically attach the JWT token (stored in AsyncStorage) to the `Authorization` header for protected routes.

### Stores (State Management)

#### [MODIFY] `frontend/store/authStore.ts`
- Remove the mock `setTimeout` implementation.
- Call `POST /auth/login` and `POST /auth/register`.
- Save the received JWT token in AsyncStorage using the new API client.
- Update the `logout` function to clear the token from AsyncStorage.

#### [MODIFY] `frontend/store/listingStore.ts`
- Add an action to fetch listings from `GET /products`.
- Add an action to create a listing by calling `POST /products`.

### Components & Screens

#### [MODIFY] `frontend/app/(tabs)/marketplace.tsx`
- Replace `LISTINGS` from `mockData.ts` with state from a `useEffect` hook that fetches data from the backend.

#### [MODIFY] `frontend/app/(tabs)/orders.tsx`
- Replace `BUYER_ORDERS` and `SELLER_ORDERS` from `mockData.ts` with calls to `GET /orders` from the backend.

#### [MODIFY] `frontend/app/listing/[id].tsx`
- Fetch a single listing using `GET /products/:id` instead of searching the mock data array.

#### [MODIFY] `frontend/app/cart.tsx` (or equivalent checkout flow)
- Submit the order to `POST /orders` when the user validates their cart.

## Verification Plan

### Automated Tests
- N/A for this task.

### Manual Verification
1. Start the backend (`npm run start` in `backend` folder).
2. Start the frontend (`npm run start` or `npm run web` in `frontend` folder).
3. Attempt to register a new user and log in.
4. Verify that the user session is preserved (token saved).
5. Attempt to view the marketplace; the list of products should match the backend's initial state.
6. Create a test order and verify it appears in the orders tab.
