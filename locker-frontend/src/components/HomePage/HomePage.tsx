import Navbar from "../NavBar/NavBar";
import './HomePage.css';
import IonIcon from "@reacticons/ionicons";
import frame_1 from "../../assets/Frame 1.svg";
import frame_2 from "../../assets/Frame 2.svg";
import frame_3 from "../../assets/Frame 3.svg";
import frame_4 from "../../assets/Frame 4.svg";
import {Component} from "react";
import {getStorages} from "../../services/api";

type HomeState = {
  loader_active: boolean,
  search_city: string
};

interface HomeProps {
}

class HomePage extends Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      loader_active: false,
      search_city: ''
    }
  }

  async search(city: string){
    window.location.href = '/storages?city=' + city;
  }

  render() {
    return (
      <>
        <Navbar/>
        <div className="main">
          <div className="container pt-3">
            <div className="d-flex flex-row flex-wrap">
              <div className="destination-header col-12 px-0 text-center d-flex justify-content-md-center">
                <div className='title_find d-flex items-center align-items-center'>
                  <h1 className="text-center ti fw-bold">FIND</h1>
                  <IonIcon name="location-sharp" className="location-sharp"
                           style={{width: "74px", height: "88px", fill: "#87BC24"}}/>
                </div>
                <div className='title_your d-flex align-items-center'>
                  <h1 className="text-center ti fw-bold">YOUR</h1>
                  <IonIcon name="arrow-forward-circle" className="arrow-forward-circle"
                           style={{width: "73px", height: "83px", fill: "#87BC24"}}/>
                </div>
                <div className='title_your d-flex'>
                  <h1 className="text-center ti">STORAGE</h1>
                </div>
              </div>
              <div className="row col-12 px-0 mx-auto justify-content-center" style={{maxWidth: "100%"}}>
                <div className="col px-0">
                  <div className="d-flex align-items-center flex-column" id="search">
                    <form className="search-form">
                      <div className="search-box">
                        <input type="text"
                               placeholder="Search for a city"
                               className="search-input"
                               onChange={(e) => {
                                  this.setState({search_city: e.target.value})
                               }}

                        />
                        <button type="submit"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  await this.search(this.state.search_city);
                                }}
                                className="btn-search btn-primary btn-regular d-md-block d-none">
                          Search
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap">
              <section className="store-section container d-flex flex-wrap my-5 pt-2 tips">
                <div className="d-flex flex-wrap align-items-start col-12 px-0 m-5">
                  <div
                    className="col-md-3 col-12 d-flex flex-md-wrap flex-nowrap align-items-md-start align-items-center mb-md-0 mb-5 px-5">
                    <div className="col-12 mr-md-0 mr-4 mb-md-4 px-0">
                      <picture>
                        <img src={frame_1}/>
                      </picture>
                    </div>
                    <div className="col-md-12 col px-md-0 pr-0">
                      <div className="col-12 mb-2 px-0 text-fs-12 text-color-light">Step 1</div>
                      <div className="title col-12 mb-2 px-0 text-fs-18">Locate</div>
                      <p className="col-12 mb-2 px-0 text-fs-12 text-color-light">Find storage on map</p>
                    </div>
                  </div>
                  <div
                    className="col-md-3 col-12 d-flex flex-md-wrap flex-nowrap align-items-md-start align-items-center mb-md-0 mb-5 px-5">
                    <div className="col-12 mr-md-0 mr-4 mb-md-4 px-0">
                      <picture>
                        <img src={frame_2}/>
                      </picture>
                    </div>
                    <div className="col-md-12 col px-md-0 pr-0">
                      <div className="col-12 mb-2 px-0 text-fs-12 text-color-light">Step 2</div>
                      <div className="title col-12 mb-2 px-0 text-fs-18">Book</div>
                      <p className="col-12 mb-2 px-0 text-fs-12 text-color-light">Pay for storage online</p>
                    </div>
                  </div>
                  <div
                    className="col-md-3 col-12 d-flex flex-md-wrap flex-nowrap align-items-md-start align-items-center mb-md-0 mb-5 px-5">
                    <div className="col-12 mr-md-0 mr-4 mb-md-4 px-0">
                      <picture>
                        <img src={frame_3}/>
                      </picture>
                    </div>
                    <div className="col-md-12 col px-md-0 pr-0">
                      <div className="col-12 mb-2 px-0 text-fs-12 text-color-light">Step 3</div>
                      <div className="title col-12 mb-2 px-0 text-fs-18">Store</div>
                      <p className="col-12 mb-2 px-0 text-fs-12 text-color-light">Store your suitcase</p>
                    </div>
                  </div>
                  <div
                    className="col-md-3 col-12 d-flex flex-md-wrap flex-nowrap align-items-md-start align-items-center mb-md-0 mb-5 px-5">
                    <div className="col-12 mr-md-0 mr-4 mb-md-4 px-0">
                      <picture>
                        <img src={frame_4}/>
                      </picture>
                    </div>
                    <div className="col-md-12 col px-md-0 pr-0">
                      <div className="col-12 mb-2 px-0 text-fs-12 text-color-light">Step 4</div>
                      <div className="title col-12 mb-2 px-0 text-fs-18">Enjoy</div>
                      <p className="col-12 mb-2 px-0 text-fs-12 text-color-light">Enjoy your hands-free walking</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </>
    );
  }

};

export default HomePage;