import React, {Component} from "react";
import Navbar from "../NavBar/NavBar";
import {getStorages} from "../../services/api";
import "./Storages.css";
import storage_logo from "../../assets/Frame 3.svg";
import {markerIcon, tilesCfg} from "../Ymaps/Ymaps";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

type StorageState = {
  loader_active: boolean,
  city: string | null,
  storages_list: [],
  map_center: [any, any]
  myRef: any
  map?: any
};

interface StorageProps {
}

export class Storage extends Component<StorageProps, StorageState> {
  constructor(props: StorageProps) {
    super(props);
    this.state = {
      loader_active: false,
      city: this.getCityFromUrl(),
      storages_list: [],
      map_center: [50, 50],
      myRef: React.createRef(),
      map: undefined
    }
  }


  getCityFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('city')
  }

  async componentWillMount() {
    const response = await getStorages(this.state.city)
    if (response.status === 200 && response.data.length > 0) {
      const map = L.map('map', {center: this.state.map_center, zoom: 10, maxZoom: 18, minZoom: 2, inertiaMaxSpeed: 1})
      L.tileLayer(tilesCfg[3].url, {}).addTo(map)
      response.data.map((storage: any) => {
        L.marker([storage.dadata_info.geo_lat, storage.dadata_info.geo_lon], {icon: markerIcon}).addTo(map);
      })
      this.setState({
        storages_list: response.data,
        map_center: [response.data[0].dadata_info.geo_lat, response.data[0].dadata_info.geo_lon],
        map: map
      })
    } else {
      window.location.href = '/'
    }
    // @ts-ignore
  }

  private focusOnMap(geo_lat: any, geo_lon: any) {
    this.state.map.flyToBounds([{lat: geo_lat, lng: geo_lon}], {animate: true, duration: 1})
  }

  private goToStorageDetail(storage_id: any) {
    return window.location.href = `/storages/${storage_id}`
  }

  render() {
    return (
      <>
        <Navbar/>
        <div className="main">
          <div className="row flex-row flex-nowrap">
            <div className="col-md-5 col-xl-7 px-0 page-left-part">
              <div className="flex-row flex-wrap justify-content-center">
                <div
                  className="angels-info py-3 pt-1 pb-1 col-12 px-0 d-flex flex-row flex-nowrap justify-content-around">
                  <div className="angels-info-price px-0 px-md-2">
                    <span className="angels-info-text ml-2">500 ₽ BAG/DAY</span>
                  </div>
                </div>
              </div>
              <div className="pl-4">
                <span className="count-color-text fs-6">{this.state.storages_list.length} <span className="text-black">storages found in {this.state.city}</span></span>
              </div>
              <div className="storage-list px-4 py-4">
                {this.state.storages_list.map((storage: any) => {
                  return (
                    <div className="storage-item"
                         onMouseEnter={(event) => {
                           this.focusOnMap(storage.dadata_info.geo_lat, storage.dadata_info.geo_lon)
                         }}
                         onClick={(event) => {
                            this.goToStorageDetail(storage.id)
                         }}
                    >
                      <div className="storage-content d-flex flex-row flex-nowrap align-items-start">
                        <div className="storage-img col px-0 m-3">
                          <img src={storage_logo} alt="storage" width={50} height={50}/>
                        </div>
                        <div
                          className="storage-description-wrap my-auto col-8 pt-2 pb-2 pb-md-2 pl-0 pr-3 d-flex flex-row flex-wrap">
                          <div className="storage-description working-hours">
                            <span
                              className="pl-1 storage-open-merged-OTI">{storage.opening_hours} - {storage.closing_hours}</span>
                          </div>
                          <div className="storage-title mb-0 text-fs-14 col-12 px-0">
                            <div>
                              <span
                                className="text-fs-10 text-color-light font-weight-normal">{storage.address_clean}</span>
                              <br/>
                              <strong>{storage.name}</strong>
                            </div>
                          </div>
                          <div className="storage-description col-12 px-0 mt-3">
                            {storage.dadata_info.metro ? storage.dadata_info.metro.map((metro: any) => {
                              return (
                                <span className="pl-1 lead">{metro.name} {metro.distance} км</span>
                              )
                            }) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="col px-0 ml-md-0 page-right-part skeleton">
              <div className="map-container" id="map">
              </div>
            </div>
          </div>
        </div>
      </>

    );
  }
}