int   sensorPin    = A0;    // turbidity sensor output
float sensorValue  = 0;  // variable to store the value coming from the sensor
float sensorValue2 = 0;

void setup() {
  Serial.begin(9600);
  Serial.println("turbidity TEST......");
}

void loop() {
  sensorValue = analogRead(sensorPin);
  sensorValue2 = (sensorValue*100/1024);
  Serial.print("turbidity value is ");
  Serial.print(sensorValue);
  Serial.print(", ");
  Serial.println(sensorValue2);
  delay(1000);
}
