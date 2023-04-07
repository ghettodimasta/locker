import {Component} from "react";
import Navbar from "../NavBar/NavBar";
import {getStorages} from "../../services/api";
import "./Storages.css";
import storage_logo from "../../assets/Frame 3.svg";

type StorageState = {
  loader_active: boolean,
  city: string | null,
  storages_list: []
};

interface StorageProps {
}

export class Storage extends Component<StorageProps, StorageState> {
  constructor(props: StorageProps) {
    super(props);
    this.state = {
      loader_active: false,
      city: this.getCityFromUrl(),
      storages_list: []
    }
  }

  getCityFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('city')
  }

  async componentWillMount() {
    const response = await getStorages(this.state.city)
    if (response.status === 200 && response.data.length > 0) {
      this.setState({storages_list: response.data})
    } else {
      window.location.href = '/'
    }
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
              <div className="pl-3">
                <span className="count-color-text fs-6">{this.state.storages_list.length} <span className="text-black">storages found in {this.state.city}</span></span>
              </div>
              <div className="storage-list px-4 py-4">
                {this.state.storages_list.map((storage: any) => {
                  return (
                    <div className="storage-item">
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
                              <span className="text-fs-10 text-color-light font-weight-normal">{storage.address_clean}</span>
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

            </div>
          </div>
        </div>
      </>

    );
  }
}