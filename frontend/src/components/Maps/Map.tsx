import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";

type Props = {
    lat?: number;
    lng?: number;
    width?: string;
    height?: string;
    popupText?: string;
    changable?: boolean;
};

const redirectToGoogleMaps = (lat: number, lng: number) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, "_blank");
};

const accessibleText = "Click to redirect to Google Maps";
const ChangeView = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

const Map = forwardRef(({ lat, lng, width, height, popupText, changable }: Props, ref) => {
    const [latitude, setLatitude] = useState<number>(44.42696654785884);
    const [longitude, setLongitude] = useState<number>(26.10248226903579);
    const [markerPosition, setMarkerPosition] = useState<LatLngExpression>([latitude, longitude]);

    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click(e) {
                if (!changable) {
                    redirectToGoogleMaps(latitude, longitude);
                    return;
                }
                setMarkerPosition([e.latlng.lat, e.latlng.lng]);
            },
        });
        return null;
    };

    const MapEnterHandler: React.FC = () => {
        useMapEvents({
            keypress(e) {
                if (e.originalEvent.key === "Enter") {
                    redirectToGoogleMaps(latitude, longitude);
                }
            },
        });
        return null;
    };

    useEffect(() => {
        if (lat && lng) {
            setLatitude(lat);
            setLongitude(lng);
        }
    }, [lat, lng]);

    useEffect(() => {
        setMarkerPosition([latitude, longitude]);
    }, [latitude, longitude]);

    useImperativeHandle(ref, () => ({
        markerPosition,
    }));

    return (
        <div>
            <MapContainer
                center={[latitude, longitude] as LatLngExpression}
                zoom={13}
                scrollWheelZoom={false}
                style={{ width: width || "100%", height: height || "400px" }}
            >
                <ChangeView center={[latitude, longitude] as LatLngExpression} zoom={13} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
                <MapEnterHandler />
                <Marker position={markerPosition || ([latitude, longitude] as LatLngExpression)}>
                    <Popup>{popupText + " " + accessibleText || "Location"}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
});

export default Map;
