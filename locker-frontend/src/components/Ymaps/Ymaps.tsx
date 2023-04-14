import L from 'leaflet';
import icon from '../../assets/Frame 3.svg';

export const tilesCfg = [
  {
    name: 'Yandex',
    url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&v=21.07.26-0-b210701140430&z={z}&x={x}&y={y}&lang=ru_RU',
    config: {
      attrib: "&copy; <a href='https://yandex.ru/legal/right_holders/?lang=ru' style='color:#333;'>Условия использования</a> <a class='app-yamap-logo' href='https://yandex.ru/maps/?origin=jsapi21'></a>",
    },
  },
  {
    name: 'YandexSatellite',
    url: 'https://core-sat.maps.yandex.net/tiles?l=sat&v=3.823.0&z={z}&x={x}&y={y}&scale=2&lang=ru_RU',
    config: {
      attrib: "&copy; <a href='https://yandex.ru/legal/right_holders/?lang=ru' style='color:#333;'>Условия использования</a> <a class='app-yamap-logo' href='https://yandex.ru/maps/?origin=jsapi21'></a>",
    },
  },
  {
    name: 'YandexHybrid',
    url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=skl&v=22.04.21-0-b220426173400&x={x}&y={y}&z={z}&scale=2&lang=ru_RU',
    config: {
      attrib: "&copy; <a href='https://yandex.ru/legal/right_holders/?lang=ru' style='color:#333;'>Условия использования</a> <a class='app-yamap-logo' href='https://yandex.ru/maps/?origin=jsapi21'></a>",
    },
  },
  {
    name: 'OSM',
    isDefault: true,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    config: {
      attrib: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
];

export const markerIcon = L.icon(
  {
    iconUrl: icon,
    iconSize: [40, 40],
  }
)

