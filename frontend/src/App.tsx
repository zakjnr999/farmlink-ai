import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ListingDraftProvider } from './context/ListingDraftContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { BuyerMarketplacePage } from './pages/BuyerMarketplacePage';
import { BuyerRecommendationsPage } from './pages/BuyerRecommendationsPage';
import { ConfirmListingPage } from './pages/ConfirmListingPage';
import { CreateOfferPage } from './pages/CreateOfferPage';
import { ExtractListingPage } from './pages/ExtractListingPage';
import { FarmerOffersPage } from './pages/FarmerOffersPage';
import { FarmerProfilePage } from './pages/FarmerProfilePage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PublishListingPage } from './pages/PublishListingPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <ListingDraftProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute roles={['FARMER']} />}>
                <Route path="/farmer/profile" element={<FarmerProfilePage />} />
                <Route path="/farmer/extract" element={<ExtractListingPage />} />
                <Route path="/farmer/listings/confirm" element={<ConfirmListingPage />} />
                <Route path="/farmer/listings/:listingId/publish" element={<PublishListingPage />} />
                <Route path="/farmer/offers" element={<FarmerOffersPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['BUYER']} />}>
                <Route path="/buyer/marketplace" element={<BuyerMarketplacePage />} />
                <Route path="/buyer/recommendations" element={<BuyerRecommendationsPage />} />
                <Route path="/buyer/offers/new/:listingId" element={<CreateOfferPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ListingDraftProvider>
    </AuthProvider>
  );
}
