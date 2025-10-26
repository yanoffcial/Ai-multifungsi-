import React, { useState, useEffect, useRef } from 'react';
import { generateWithGoogleMaps } from '../../services/geminiService';
import type { GroundedMapsResult } from '../../services/geminiService';
import MessageContent from '../../components/MessageContent';
import { MapIcon } from '../../components/icons/FeatureIcons';

// Use 'any' for Leaflet to avoid complex type installation in this environment
declare const L: any;

const LocationFinder: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<GroundedMapsResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState('Meminta lokasi...');

    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const userMarkerRef = useRef<any>(null);

    // Get user location on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    setLocationStatus(`Lokasi ditemukan: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                },
                (err) => {
                    console.error("Error getting location:", err);
                    setLocationStatus('Gagal mendapatkan lokasi. Pencarian berbasis lokasi mungkin tidak akurat.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationStatus('Geolocation tidak didukung oleh browser ini.');
        }
    }, []);
    
    // Initialize map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current).setView(userLocation ? [userLocation.lat, userLocation.lng] : [-6.200000, 106.816666], 13); // Default to Jakarta
             L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);
            mapRef.current = map;
        }
    }, [userLocation]);

    // Update map view and marker when user location changes
    useEffect(() => {
        if (mapRef.current && userLocation) {
            mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
            } else {
                 const userIcon = L.divIcon({
                    html: `<div class="w-4 h-4 rounded-full bg-violet-500 border-2 border-white shadow-lg animate-pulse"></div>`,
                    className: '',
                    iconSize: [16, 16],
                });
                userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(mapRef.current)
                    .bindPopup('<b>Lokasi Anda</b>');
            }
        }
    }, [userLocation]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const coords = userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : undefined;
            const response = await generateWithGoogleMaps(prompt, coords);
            if (typeof response === 'string') {
                setError(response);
            } else {
                setResult(response);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
            <div className="flex-shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white">Pencari Lokasi</h2>
                <p className="text-sm text-zinc-400">Temukan tempat menarik di sekitar Anda, didukung oleh Google Maps.</p>
                <p className="text-xs text-zinc-500 mt-1">{locationStatus}</p>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* Left Panel: Search and Results */}
                <div className="w-full md:w-1/2 flex flex-col space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            rows={2}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="Contoh: restoran Italia di dekat sini"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Mencari...' : 'Cari Tempat'}
                        </button>
                    </form>

                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 min-h-[200px]">
                            {isLoading && <p className="text-zinc-500 animate-pulse">Mencari di Google Maps...</p>}
                            {error && <p className="text-red-400">{error}</p>}
                            {result && (
                                <div className="space-y-4 animate-fade-in">
                                    <MessageContent text={result.text} />
                                    {result.places.length > 0 && (
                                        <div className="pt-4 border-t border-zinc-700/50">
                                            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Tempat yang Ditemukan:</h3>
                                            <ul className="space-y-1">
                                                {result.places.map((place, index) => (
                                                    <li key={index} className="truncate">
                                                        <a href={place.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline hover:text-violet-300">
                                                            {place.title}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                             {!isLoading && !result && !error && (
                                <div className="flex items-center justify-center h-full text-center text-zinc-500">
                                    <p>Hasil pencarian lokasi akan muncul di sini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Map */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <div ref={mapContainerRef} className="w-full h-full min-h-[300px] md:min-h-0 bg-zinc-950 rounded-lg border border-zinc-800">
                         {!userLocation && (
                            <div className="flex items-center justify-center h-full text-zinc-500">
                                Memuat peta...
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationFinder;