package dev.uktcteam.hackathon.pathfinding.logic;

import java.util.Objects;

public class Coordinate {
    String point1;
    String point2;
    int distance;

    public Coordinate(String point1, String point2) {
        this.point1 = point1;
        this.point2 = point2;
    }

    public Coordinate(String point1, String point2, int distance) {
        this.point1 = point1;
        this.point2 = point2;
        this.distance = distance;
    }

    @Override
    public int hashCode() {
        return Objects.hash(point1, point2);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;
        Coordinate coordinate = (Coordinate) obj;
        return Objects.equals(point1, coordinate.point1) && Objects.equals(point2, coordinate.point2);
    }

    @Override
    public String toString() {
        return "Coordinate{" +
                "point1='" + point1 + '\'' +
                ", point2='" + point2 + '\'' +
                ", distance=" + distance +
                '}';
    }
}
