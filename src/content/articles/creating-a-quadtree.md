---
title: Creating a Simple but Effective QuadTree
date: 2026-08-24
description: How I implemented a QuadTree from scratch in Java.
tags: Java, Data Structures, Algorithms
---

A QuadTree is a spatial data structure that recursively divides
two-dimensional space into four regions.

## What is a QuadTree?

A QuadTree divides a two-dimensional area into four smaller regions
when a node contains too many objects.

This makes it useful for things such as collision detection,
spatial queries, and simulations.

## Implementation

I implemented my own QuadTree in Java.

```java
public class QuadTree {

    private Node root;

    public QuadTree(AABB2 bounds) {
        root = new Node(bounds);
    }
}
```