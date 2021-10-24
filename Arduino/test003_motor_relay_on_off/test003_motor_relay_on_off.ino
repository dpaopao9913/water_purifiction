int     motor_relay_pin             = 7;

void setup() {
  Serial.begin(9600);
  Serial.println("PROGRAM START......");
  
  // motor relay pin init
  //pinMode( motor_relay_pin, OUTPUT );
  //digitalWrite( motor_relay_pin, LOW );
}

void loop() {
  pinMode( motor_relay_pin, OUTPUT );
  digitalWrite(motor_relay_pin, LOW);
  delay(3000);
  digitalWrite(motor_relay_pin, HIGH);
  delay(3000);
  //pinMode( motor_relay_pin, INPUT );
  //delay(3000);
}
