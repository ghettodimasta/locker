import React, { useState, useRef } from 'react';
import './SearchBar.css';

export function SearchBar(props: { search_city: string; cities: string[] }) {
  const [search_city, set_search_city] = useState<string>('');
  const input_ref = useRef<HTMLInputElement>(null);
  const dropdown_ref = useRef<HTMLDivElement>(null);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  function search(city: string) {
    if (city === '')
      window.location.href = '/not_found';
    window.location.href = '/storages?city=' + city;
  }

  function updateDropdownMenu(inputVal: string) {
    const filtered = props.cities.filter((city) =>
      city.toLowerCase().includes(inputVal.toLowerCase())
    );
    const sorted = filtered.sort();

    setFilteredCities(sorted);
    set_search_city(sorted[0] || ''); // set search_city to the first filtered city value
  }

  function handleInputClick() {
    dropdown_ref.current?.classList.toggle('show');
  }

  function handleInputFocus() {
    dropdown_ref.current?.classList.add('show');
  }

  function handleInputBlur() {
    setTimeout(() => {
      dropdown_ref.current?.classList.remove('show');
    }, 200);
  }

  return (
    <div className="search-box">
      <input
        aria-haspopup="true"
        aria-expanded="false"
        data-toggle="dropdown"
        type="text"
        ref={input_ref}
        placeholder="search city"
        className="search-input dropdown-toggle form-control"
        id="dropdownCityInput"
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onChange={(e) => {
          updateDropdownMenu(e.target.value);
        }}
      />
      <div
        className="dropdown-menu dropdown-menu-end"
        aria-labelledby="dropdownCityInput"
        ref={dropdown_ref}
        style={{ width: input_ref.current?.offsetWidth }}
      >
        {filteredCities.length > 0 ? (
          filteredCities.map((option, index) => {
            return (
              <div
                onClick={() => {
                  set_search_city(option);
                  setFilteredCities([]);
                  search(option);
                }}
                className="dropdown-item"
                key={'c' + index}
              >
                <span>{option}</span>
              </div>
            );
          })
        ) : (
          <div className="dropdown-item">This city is unavailable</div>
        )}
      </div>
      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          search(search_city);
        }}
        className="btn-search btn-primary btn-regular d-md-block d-none"
      >
        search
      </button>
    </div>
  );
}
