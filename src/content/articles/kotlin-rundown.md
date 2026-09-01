---
title: A Kotlin Rundown
date: 2026-08-27
description: A short overview of the Kotlin syntax.
tags:
  - Kotlin
---

## Overview

- Kotlin is a language heavily based on Java, but looks to cut down on the verbosity of the former.
- Kotlin does not require semicolons, as it relies on line breaks instead for syntax

## Variables

- Kotlin distinguishes between mutable and immutable variables

```Kotlin

val x = 100     // immutable
var y = 150     // mutable

```

- Type inference is used, but a specific type can be declared

```Kotlin

val x: Double = 15.0

```

## Functions

- The length of functions in Kotlin is much shorter than in Java
- Functions are ```public``` by default

```Kotlin

fun add(a: Int, b: Int): Int {
    return a + b
}

```

or

```Kotlin

fun add(a: Int, b: Int) = a + b

```


## Classes

- Similar to Java

```Kotlin

class Ball(var x: Double, var y: Double, var radius: Double) {
    fun update(dt: Double) {
        x += 10.0 * dt
    }
}

```

- Which allows simple object creation

```Kotlin

val ball = Ball(100.0, 200.0, 20.0)

```

## Inheritence

- The ```open``` keyword allows a class to be inherited
- Classes are ```final``` by default

```Kotlin

open class Vehicle() {
    // ...
}

```

- Can now be inherited with

```Kotlin

class Car : Vehicle() {
    // ...
}

```

- Methods can also be overwritten

```Kotlin

open class Vehicle {
    open fun beep() {
        // Default behavior
    }
}

class Car : Vehicle() {
    override fun beep() {
        // Different behavior
    }
}

```

## Interfaces

- Follow similar syntax to Java

```Kotlin

interface IVehicle {
    fun collide(beep)
}

```

- Which allows classes to overwrite interface methods

```Kotlin

class Motorcycle : IVehicle {
    override fun beep() {
        // Beep
    }
}

```

## Data Classes

- Allows for simple classes to contain fields with little writing
- Kotlin automatically provides methods such as ```equals```, ```hashCode```, ```toString```, and ```copy```

```Kotlin

data class Vector2(
    val x: Double,
    val y: Double
)

```

## Nullability

- Kotlin requires explicit distinguishing for variables that can possibly be null

```Kotlin

var truck: Truck? = null

```

- The ```?``` symbol states that a variable can be ```null```
- Kotlin must know if a variable can be null to do something with it

```Kotlin

truck?.beep()

```

or

```Kotlin

if (truck != null) {
    truck.update()
}

```

- The ```!!``` symbol can be used to declare a variable cannot be null, using it should be avoided

```Kotlin

truck!!.update()

```

## Collections

- Kotlin has a simple syntax for collections

```Kotlin

val cars = mutableListOf<Car>()

// Add
cars.add(Car())

// Loop
for(car in cars) {
    car.beep()
}

```

- Functional operations such as are ```map```, ```filter```, ```forEach```, ```any```, ```all```, and ```find``` common

```Kotlin

val largeBalls = balls.filter { it.radius > 20 }

```

or

```Kotlin

val speeds = balls.map { it.velocity.length() }

```

- ```it``` represents the current element

## Lambda Functions

```Kotlin

val numbers = listOf(1, 2, 3, 4)

numbers.forEach {
    println(it)
}

```

or

```Kotlin

numbers.forEach { number ->
    println(number)
}


```


## Enums

- Enums work identically to Java

```Kotlin

enum class Weather {
    SUNNY,
    OVERCAST,
    RAIN
}

```