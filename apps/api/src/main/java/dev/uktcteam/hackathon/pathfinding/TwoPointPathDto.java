package dev.uktcteam.hackathon.pathfinding;

import lombok.Data;

import java.awt.*;

@Data
public class TwoPointPathDto {
    private PointDto start;
    private Point[] path;
    private PointDto end;
}
