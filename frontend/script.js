  <script>
    let main_page = document.getElementById("main");
    let selection_tag = document.getElementById("selection");

    let operating_values = JSON.parse(localStorage.getItem("operating_values")) || {
      "preset": "",
      "temp": "",
      "humid": "",
      "lux": "",
      "air": "",
    };

    function saveToLocalStorage() {
      localStorage.setItem("setup_complete", true);
      localStorage.setItem("operating_values", JSON.stringify(operating_values));
    }

    let loading_param = `<div class="loading-anim">
        <div class="member"></div>
        <div class="loading-txt">Adjusting Parameters...</div>
      </div>`;

    let loading_custom = `<div class="loading-anim">
        <div class="member"></div>
        <div class="loading-txt">Connecting To Server...</div>
      </div>`;

    let custom_signin = `<div class="custom-sign">
        <div class="custom-signTitle">Custom Storage Preset</div>
        <div class="forums">
          <div class="questionTitle">Preset Name</div>
          <input type="text" class="input-txt" id="preset-name" placeholder="example: Historical Monuments">
          <hr>
          <div class="questionTitle space">Custom Thresholds</div>
          <div class="setup-custom-thresholds">
            <div class="threshold">
              <div class="subQuestionTitle">Temperature</div>
              <input type="number" class="input-numb" id="temp-custom" placeholder="20 C">
            </div>
            <div class="threshold">
              <div class="subQuestionTitle">Humidity</div>
              <input type="number" class="input-numb" id="humid-custom" placeholder="50 %">
            </div>
            <div class="threshold">
              <div class="subQuestionTitle">Light Intensity</div>
              <input type="number" class="input-numb" id="lux-custom" placeholder="500 lux">
            </div>
            <div class="threshold">
              <div class="subQuestionTitle">Air Pollutants</div>
              <input type="number" class="input-numb" id="air-custom" placeholder="35 %">
            </div>
          </div>
          <div class="signin-btn" id="custom-signin-btn" btn>Proceed</div>
          <div class="custom-btn" id="back-btn" btn>Go Back</div>
        </div>
      </div>`;

    let sign_in = `
    <div class="sign">
        <div class="left-side">
          <div class="signLeftText">
            <div class="signTitle">Welcome!</div>
            <div class="signSubTitle">-- SetUp your SafeMed System --</div>
          </div>
        </div>
        <div class="right-side">
          <div class="signQuestion">
            <div class="questionTitle">What are you storing?</div>
            <div class="selectionContainer">
              <select class="selection" id="selection">
                <option id="med" value="med">Medicine & Medical Equipment</option>
                <option id="food" value="food">Food & Nutritions</option>
                <option id="elec" value="elec">Electrical Devices & Batteries</option>
                <option id="radio" value="radioactive">Radioactive Substances</option>
              </select>
            </div>
            <div class="signin-btn" id="signin-btn" btn>Proceed</div>
            <div class="custom-btn" id="custom-btn" btn>My Storage Isn't Listed</div>
          </div>
        </div>
      </div>`;

    let dashboard_content = `<div class="header">
        <div class="team">
          <div class="title">International Science and Engineering Fair - 2025</div>
          <div class="subtitle">SafeMed: Monitoring System for Storage Facilities</div>
        </div>
    </div>
    <div class="content" id="displayed">
      <div class="graphs">
      <div class="parameter">
      <div class="p-txt">
        <div class="p-title">Temperature:</div>
        <div id="live-temp" class="reading"></div>
        <div class="unit"><sup>o</sup>C</div>
      </div>
      <div class="live-bar">
        <div class="bar-cursor" id="temp-cursor"></div>
      </div>
      </div>
      <div class="parameter">
      <div class="p-txt">
        <div class="p-title">Humidity:</div>
        <div id="live-humid" class="reading"></div>
        <div class="unit">%</div>
      </div>
      <div class="live-bar humid">
        <div class="bar-cursor" id="humid-cursor"></div>
      </div>
      </div>
      <div class="parameter">
      <div class="p-txt">
        <div class="p-title">Air Pollutants:</div>
        <div id="live-air" class="reading"></div>
        <div class="unit">ppm</div>
      </div>
      <div class="live-bar">
        <div class="bar-cursor" id="air-cursor"></div>
      </div>
      </div>
      <div class="parameter">
      <div class="p-txt">
        <div class="p-title">Light Intensity:</div>
        <div id="live-lux" class="reading"></div>
        <div class="unit">lux</div>
      </div>
      <div class="live-bar">
        <div class="bar-cursor" id="lux-cursor"></div>
      </div>
      </div>            
    </div>
    <div class="status-bar">
      <div class="index">
        <div class="s-txt">Danger Index</div>
      <div class="s-tag" id="status">LOW</div>
      </div>
    </div>
    </div>
  </div>`;

    // main_page.innerHTML = sign_in;

    document.addEventListener("click", function (e) {
      let targetElement = e.target;
      if (targetElement.id === "signin-btn") {
        load_preset(selection.value);
        main_page.innerHTML = loading_param;
        setTimeout(function () {
          initializePage();
        }, 2348);
      } else if (targetElement.id === "custom-btn") {
        main_page.innerHTML = loading_custom;
        setTimeout(function () {
          main_page.innerHTML = custom_signin;
        }, 2348);
      } else if (targetElement.id === "back-btn") {
        main_page.innerHTML = loading_custom;
        setTimeout(function () {
          main_page.innerHTML = sign_in;
        }, 2348);
      } else if (targetElement.id === "custom-signin-btn") {
        let preset_name = document.getElementById("preset-name").value;
        let custom_temp = document.getElementById("temp-custom").value;
        let custom_humid = document.getElementById("humid-custom").value;
        let custom_lux = document.getElementById("lux-custom").value;
        let custom_air = document.getElementById("air-custom").value;

        operating_values = {
          "preset": preset_name,
          "temp": custom_temp,
          "humid": custom_humid,
          "lux": custom_lux,
          "air": custom_air,
        };
        saveToLocalStorage();

        main_page.innerHTML = loading_param;
        setTimeout(function () {
          initializePage();
        }, 2348);
      }
    });

    function refreshDashboard(arr) {

      console.log(operating_values);

      let temp_txt = document.getElementById('live-temp');
      let humid_txt = document.getElementById('live-humid');
      let lux_txt = document.getElementById('live-lux');
      let air_txt = document.getElementById('live-air');

      let stat = document.getElementById("status");
      let danger = 0;

      let temp_cursor = document.getElementById('temp-cursor');
      let humid_cursor = document.getElementById('humid-cursor');
      let lux_cursor = document.getElementById('lux-cursor');
      let air_cursor = document.getElementById('air-cursor');

      temp_txt.innerText = arr.temp || 'N/A';
      humid_txt.innerText = arr.humid || 'N/A';
      lux_txt.innerText = arr.lux || 'N/A';
      air_txt.innerText = arr.air || 'N/A';

      let temp_V1 = operating_values.temp;
      let temp_V2 = operating_values.temp + 15;
      let temp_V3 = operating_values.temp + 30;
      let temp_level;

      let humid_V1 = operating_values.humid;
      let humid_V2 = operating_values.humid + 15;
      let humid_V3 = operating_values.humid + 30;
      let humid_level;

      let lux_V1 = operating_values.lux;
      let lux_V2 = operating_values.lux + 150;
      let lux_V3 = operating_values.lux + 300;
      let lux_level;

      let air_V1 = operating_values.air;
      let air_V2 = operating_values.air + 50;
      let air_V3 = operating_values.air + 100;
      let air_level;

      if (arr.temp <= temp_V1) {
        temp_cursor.style.setProperty("left", `calc(${arr.temp * 35 / temp_V1}% - 10px)`)
        temp_level = 0;
      } else if (arr.temp > temp_V1 && arr.temp < temp_V3) {
        temp_cursor.style.setProperty("left", `calc(${(arr.temp) * 65 / (temp_V3 - temp_V1)}% - 30% - 10px)`)
        temp_level = 1;
      } else {
        temp_cursor.style.setProperty("left", `calc(100% - 10px)`)
        temp_level = 1;
      }

      if (arr.lux <= lux_V1) {
        lux_cursor.style.setProperty("left", `calc(${arr.lux * 35 / lux_V1}% - 10px)`)
        lux_level = 0;
      } else if (arr.lux > lux_V1 && arr.lux < lux_V3) {
        lux_cursor.style.setProperty("left", `calc(${(arr.lux) * 65 / (lux_V3 - lux_V1)}% - 30% - 10px)`)
        lux_level = 1;
      } else {
        lux_cursor.style.setProperty("left", `calc(100% - 10px)`)
        lux_level = 1;
      }

      if (arr.air <= air_V1) {
        air_cursor.style.setProperty("left", `calc(${arr.air * 35 / air_V1}% - 10px)`)
        air_level = 0;
      } else if (arr.air > air_V1 && arr.air < air_V3) {
        air_cursor.style.setProperty("left", `calc(${(arr.air) * 65 / (air_V3 - air_V1)}% - 30% - 10px)`)
        air_level = 1;
      } else {
        air_cursor.style.setProperty("left", `calc(100% - 10px)`)
        air_level = 1;
      }
      
      if (arr.humid <= 100) {
        humid_cursor.style.setProperty("left", `calc(${arr.humid}% - 10px)`)
      } else {
        humid_cursor.style.setProperty("left", `calc(100% - 10px)`)
      }

      if (arr.humid <= humid_V1) {
        humid_level = 0;
      } else {
        humid_level = 1;
      }

      danger = humid_level + temp_level + lux_level + air_level;
      switch (danger) {
        case 0:
          stat.innerText = "NO DANGER";
          stat.style.setProperty("background-color", "rgba(0, 150, 0, 0.7)");
          break;

        case 1:
          stat.innerText = "LOW";
          stat.style.setProperty("background-color", "rgba(150, 150, 0, 0.7)");
          break;

        case 2:
          stat.innerText = "LOW";
          stat.style.setProperty("background-color", "rgba(150, 150, 0, 0.7)");
          break;

        case 3:
          stat.innerText = "HIGH";
          stat.style.setProperty("background-color", "rgba(150, 0, 0, 0.7)");
          break;
          
        case 4:
          stat.innerText = "EXTREME";
          stat.style.setProperty("background-color", "rgba(150, 0, 150, 0.7)");
          break;
        } 
    }

    function initializePage() {
      let setupComplete = localStorage.getItem("setup_complete");
      if (setupComplete) {
        main_page.innerHTML = dashboard_content;
        setInterval(function() {
          google.script.run.withSuccessHandler(refreshDashboard).postData();
        }, 1000);
      } else {
        main_page.innerHTML = sign_in;
      }
    }

    initializePage();


    function load_preset(selected_preset) {
      switch (selected_preset) {
        case "med":
          operating_values = { preset: selected_preset, temp: 25, humid: 60, lux: 300, air: 50 };
          break;
        case "food":
          operating_values = { preset: selected_preset, temp: 22, humid: 60, lux: 300, air: 50 };
          break;
        case "elec":
          operating_values = { preset: selected_preset, temp: 24, humid: 60, lux: 500, air: 50 };
          break;
        case "radioactive":
          operating_values = { preset: selected_preset, temp: 25, humid: 50, lux: 100, air: 50 };
          break;
      }
      saveToLocalStorage();
    }

  </script>
