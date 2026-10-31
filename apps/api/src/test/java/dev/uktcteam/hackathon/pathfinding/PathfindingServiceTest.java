package dev.uktcteam.hackathon.pathfinding;

import dev.uktcteam.hackathon.entities.checkout.Checkout;
import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinate;
import dev.uktcteam.hackathon.entities.itemcoordinate.ItemCoordinateRepository;
import dev.uktcteam.hackathon.entities.product.Product;
import dev.uktcteam.hackathon.entities.product.ProductDto;
import dev.uktcteam.hackathon.entities.product.ProductService;
import dev.uktcteam.hackathon.entities.store.StoreRepository;
import dev.uktcteam.hackathon.entities.trafficflow.TrafficFlow;
import dev.uktcteam.hackathon.pathfinding.logic.CoordinateMatrix;
import dev.uktcteam.hackathon.pathfinding.logic.RouteOptimizer;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PathfindingServiceTest {

    @Test
    void productBesideEntranceReturnsAZeroLengthSegmentWithoutEnteringTheShelf() {
        var stores = mock(StoreRepository.class);
        var coordinates = mock(ItemCoordinateRepository.class);
        var products = mock(ProductService.class);
        var matrix = new CoordinateMatrix();
        var service = new PathfindingService(new RouteOptimizer(matrix), matrix, products, stores, coordinates);
        var product = mock(ProductDto.class);
        when(stores.existsById(1L)).thenReturn(true);
        when(products.getProductById(1L)).thenReturn(product);
        when(coordinates.findByStoreId(1L)).thenReturn(List.of(
                new ItemCoordinate(1L, 0, 0, null, null, null, TrafficFlow.builder().name("entry").build()),
                new ItemCoordinate(2L, 0, 3, null, null, null, TrafficFlow.builder().name("exit").build()),
                new ItemCoordinate(3L, 1, 0, null, Product.builder().id(1L).build(), null, null),
                new ItemCoordinate(4L, 1, 2, null, null, Checkout.builder().name("normal_checkout").build(), null)
        ));

        var result = service.findPath(1L, new String[] { "P1" });

        assertEquals(3, result.getPathfind().length);
        var firstSegment = result.getPathfind()[0];
        assertEquals("EN", firstSegment.getStart().getId());
        assertEquals("P1", firstSegment.getEnd().getId());
        assertEquals(0, firstSegment.getStart().getX());
        assertEquals(0, firstSegment.getStart().getY());
        assertEquals(0, firstSegment.getEnd().getX());
        assertEquals(0, firstSegment.getEnd().getY());
        assertEquals(0, firstSegment.getPath().length);
        assertSame(product, result.getSorted()[1]);
    }
}
