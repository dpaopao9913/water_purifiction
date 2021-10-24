import RPi.GPIO as GPIO
from time import sleep

RELAY_PIN = 18

GPIO.setmode(GPIO.BCM)
# GPIO.setup(RELAY_PIN, GPIO.OUT)
counter = 0


while True:
    counter += 1
    if counter % 2 == 0:
        GPIO.setup(RELAY_PIN, GPIO.OUT)
        GPIO.output(RELAY_PIN, True)
        sleep(1)
        GPIO.output(RELAY_PIN, False)
        sleep(1)
    else:
        GPIO.setup(RELAY_PIN, GPIO.IN)
        a = GPIO.input(RELAY_PIN)
        print(a)
        sleep(1)