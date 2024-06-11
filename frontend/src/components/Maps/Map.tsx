import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";

type Props = {
    lat?: number;
    lng?: number;
    width?: string;
    height?: string;
    popupText?: string;
    changable?: boolean;
};

const Map = forwardRef(({ lat, lng, width, height, popupText, changable }: Props, ref) => {
    const [latitude, setLatitude] = useState<number>(44.42696654785884);
    const [longitude, setLongitude] = useState<number>(26.10248226903579);
    const [markerPosition, setMarkerPosition] = useState<LatLngExpression>([latitude, longitude]);

    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click(e) {
                if (!changable) return;
                setMarkerPosition([e.latlng.lat, e.latlng.lng]);
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

    useImperativeHandle(ref, () => ({
        markerPosition,
    }));

    return (
        <MapContainer
            center={[latitude, longitude] as LatLngExpression}
            zoom={13}
            scrollWheelZoom={false}
            style={{ width: width || "100%", height: height || "400px" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler />
            <Marker position={markerPosition || ([latitude, longitude] as LatLngExpression)}>
                <Popup>{popupText || "Location"}</Popup>
            </Marker>
        </MapContainer>
    );
});

export default Map;
