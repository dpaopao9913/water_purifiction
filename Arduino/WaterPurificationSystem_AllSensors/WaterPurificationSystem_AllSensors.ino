#include <LiquidCrystal.h>
#include <Wire.h>                                  // I2C connection

// turbidity
#define       TURBIDITY_SENSOR_PIN          A0     // turbidity sensor pin
float         turbidity_val               = 0;     // turbidity value
const float   turbidity_thres             = 80;
// buzzer
#define       BUZZER_SENSOR_PIN             6      // buzzer sensor pin
int           counter                     = 0;
const int     counter_thres               = 5;
boolean       isWaterPurificationFinished = false;
unsigned long t_start                     = 0;
unsigned long t_end                       = 0;
const int     buzzer_duration             = 3000;
// motor relay
#define       MOTOR_RELAY_PIN               7
// LCD
const int rs = 9, en = 8, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);
// I2C connection
const int     i2c_bus_addr                = 0x8;
#define       IS_PROGRAM_FINISHED_PIN       10
int           readVal                     = 0;



void setup() {
  Serial.begin(9600);
  Serial.println("PROGRAM START......");
  
  // buzzer pin init
  pinMode( BUZZER_SENSOR_PIN, OUTPUT );
  digitalWrite( BUZZER_SENSOR_PIN, LOW );
  
  // motor relay pin init
  pinMode( MOTOR_RELAY_PIN, OUTPUT );
  digitalWrite( MOTOR_RELAY_PIN, LOW );
  
  // LCD display init
  lcd.begin(16, 2);
  lcd.print("program started");
  
  // I2C connection
  Wire.begin(i2c_bus_addr);
  Wire.onRequest(sendData);
  Wire.onReceive(receiveData);
  pinMode( IS_PROGRAM_FINISHED_PIN, OUTPUT );
  digitalWrite( IS_PROGRAM_FINISHED_PIN, LOW );
}

void sendData() {
  Wire.write((byte)turbidity_val);
}

void receiveData(int bytestream) {
  while(Wire.available()){
     readVal = Wire.read();   
     switch(readVal){
       case 0:                // start water purification
         digitalWrite( MOTOR_RELAY_PIN, HIGH );
         lcd.clear();
         lcd.print("program started");
         isWaterPurificationFinished = false;
         counter = 0;
         break;
       case 1:                // forcely stop water purification
         digitalWrite( MOTOR_RELAY_PIN, LOW );
         lcd.clear();
         lcd.print("program finished");
    }
  }
}

void loop() {
  turbidity_val = analogRead(TURBIDITY_SENSOR_PIN);
  turbidity_val = turbidity_val * 100/1024;
  Serial.print("turbidity value is ");
  Serial.println(turbidity_val);
  lcd.setCursor(0, 1);
  lcd.print(turbidity_val);
  
  if(turbidity_val <= turbidity_thres) {
     counter = 0;
  }else {
    counter += 1;
    if(counter >= counter_thres && isWaterPurificationFinished == false) {
      digitalWrite( BUZZER_SENSOR_PIN, HIGH );
      digitalWrite( MOTOR_RELAY_PIN, LOW );
      //Serial.println("water purification finished !!");
      lcd.clear();
      lcd.print("program finished");
      lcd.setCursor(0, 1);
      lcd.print(turbidity_val);
      isWaterPurificationFinished = true;
      digitalWrite(IS_PROGRAM_FINISHED_PIN, HIGH); // for raspi read
      delay(100);
      digitalWrite(IS_PROGRAM_FINISHED_PIN, LOW);
      t_start = millis();
    }
  }
  
  if(isWaterPurificationFinished && digitalRead(BUZZER_SENSOR_PIN) == HIGH) {
    if(millis() - t_start >= buzzer_duration) {
      digitalWrite( BUZZER_SENSOR_PIN, LOW );
      //Serial.println("buzzer stopped.");
    } 
  } 
  
  delay(3000);
}
