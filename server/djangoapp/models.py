import datetime

from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class CarMake(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name


class CarModel(models.Model):

    SEDAN = "Sedan"
    SUV = "SUV"
    HATCHBACK= "Hatchback"
    WAGON = "Wagon"

    CAR_TYPES = [
        (SEDAN, "Sedan"),
        (SUV, "SUV"),
        (HATCHBACK, "Hatchback"),
        (WAGON, "Wagon"),
    ]

    car_make = models.ForeignKey(
        CarMake,
        on_delete=models.CASCADE,
        related_name="models"
    )

    name = models.CharField(max_length=100)

    type = models.CharField(
        max_length=20,
        choices=CAR_TYPES,
        default=SEDAN
    )
    def current_year():
        return datetime.datetime.now().year

    year = models.IntegerField(
        validators=[
            MinValueValidator(1980),
            MaxValueValidator(current_year())
        ]
    )

    def __str__(self):
        return self.name