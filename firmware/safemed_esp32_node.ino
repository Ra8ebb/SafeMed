// -------------------- Wi-Fi Define Start ----------------
#include "WiFi.h"
#include <HTTPClient.h>
#define On_Board_LED_PIN  2

const char* ssid = "Bandit enters the room";  
const char* password = "handitbeeler";

String Web_App_URL = "https://script.google.com/macros/s/AKfycbw14YklddZl3TtGWyYIaP7Tx_abE2177npgNJXs-BzLdlcv3eFI0ihVNdasZO_cKktjOg/exec";
float T;
float H;
float S;
float L;
// -------------------- Wi-Fi Define End ----------------

// -------------------- MQ-2 Define Start ----------------
#include <MQUnifiedsensor.h>
#define         Board                   ("ESP-32")
#define         Pin                     (35) 
#define         Type                    ("MQ-2")
#define         Voltage_Resolution      (5)
#define         ADC_Bit_Resolution      (12)
#define         RatioMQ2CleanAir        (9.83)

float gas;
MQUnifiedsensor MQ2(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin, Type);
// -------------------- MQ-2 Define End ----------------

// ---------- DHT11 Init Start ----------
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#define DHTPIN 23
#define DHTTYPE DHT11
DHT_Unified dht(DHTPIN, DHTTYPE);
uint32_t delayMS;
float temp;
float humid;
// ---------- DHT11 Init End ----------

// ---------- LDR Init Start ----------
#define LDR 34
float intensity;
// ---------- LDR Init End ----------

void setup() {
  Serial.begin(9600); 

  // ----- Wi-Fi Setup Start ---------
  pinMode(On_Board_LED_PIN, OUTPUT);
  // Set Wifi to STA mode
  Serial.println();
  Serial.println("-------------");
  Serial.println("WIFI mode : STA");
  WiFi.mode(WIFI_STA);
  Serial.println("-------------");
  // Connect to Wi-Fi (STA).
  Serial.println();
  Serial.println("------------");
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int connecting_process_timed_out = 20; //--> 20 = 20 seconds.
  connecting_process_timed_out = connecting_process_timed_out * 2;
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    digitalWrite(On_Board_LED_PIN, HIGH);
    delay(250);
    digitalWrite(On_Board_LED_PIN, LOW);
    delay(250);
    if (connecting_process_timed_out > 0) connecting_process_timed_out--;
    if (connecting_process_timed_out == 0) {
      delay(1000);
      ESP.restart();
    }
  }
  digitalWrite(On_Board_LED_PIN, LOW);
  Serial.println("WiFi connected");
  // ----- Wi-Fi Setup End ---------

  // ---------- MQ-2 Setup Start ----------
  MQ2.setRegressionMethod(1);
  MQ2.setA(36974); MQ2.setB(-3.109);
  /*
    Exponential regression:
    Gas    | a      | b
    H2     | 987.99 | -2.162
    LPG    | 574.25 | -2.222
    CO     | 36974  | -3.109
    Alcohol| 3616.1 | -2.675
    Propane| 658.71 | -2.168
  */
  MQ2.init(); 
  float calcR0 = 0;
  for(int i = 1; i<=10; i ++)
  {
    MQ2.update();
    calcR0 += MQ2.calibrate(RatioMQ2CleanAir);
  }
  MQ2.setR0(calcR0/10);
  MQ2.serialDebug(true);
  // ---------- MQ-2 Setup End ----------

  // ---------- DHT11 Setup Start ----------
  dht.begin();
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  dht.humidity().getSensor(&sensor);
  delayMS = sensor.min_delay / 1000;
  // ---------- DHT11 Setup End ----------

  // ---------- LDR Setup Start ----------
  pinMode(LDR, INPUT);
  // ---------- LDR Setup End ----------
}

void loop() {

  // ---------- DHT11 Loop Start ----------
  delay(delayMS);
  sensors_event_t event;
  dht.temperature().getEvent(&event);
  temp = event.temperature;
  dht.humidity().getEvent(&event);
  humid = event.relative_humidity;
  // ---------- DHT11 Loop End ----------

  // ---------- LDR Loop Start ----------
  intensity = analogRead(LDR);
  // ---------- LDR Loop End ----------

  // ---------- MQ-2 Loop Start ----------
  MQ2.update();
  gas = MQ2.readSensor();
  // ---------- MQ-2 Loop End ----------

  // ----- Wi-Fi Loop Start ---------
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(On_Board_LED_PIN, HIGH);

    // Create a URL for sending or writing data to Google Sheets.
    T = temp;
    H = humid;
    // S = gas;
    L = intensity;
    String Send_Data_URL = Web_App_URL + "?sts=write" + "&temp=" + T + "&humid=" + H + "&lux=" + L;

    // Initialize HTTPClient as "http".
    HTTPClient http;
    // HTTP GET Request.
    http.begin(Send_Data_URL.c_str());
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    // Gets the HTTP status code.
    int httpCode = http.GET(); 
    Serial.print("HTTP Status Code : ");
    Serial.println(httpCode);
    // Getting response from google sheets.
    String payload;
    if (httpCode > 0) {
      payload = http.getString();
      Serial.println("Payload : " + payload);    
    }
      
    http.end();
    
    digitalWrite(On_Board_LED_PIN, LOW);
  }
  // ----- Wi-Fi Loop End ---------
}
