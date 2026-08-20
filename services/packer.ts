import { Item, PlacedItem, Truck, LoadResult } from '../types';

/**
 * AI-Based Dynamic Load Balancing and Cargo Space Optimization.
 * Uses a heuristic bin packing algorithm that considers both volume and weight.
 * Heavy items are prioritized for bottom placement to ensure safety and a low Center of Gravity.
 */
export const packTruck = (truck: Truck, itemsToPack: Item[]): LoadResult => {
  if (!truck || !itemsToPack || !truck.dimensions) {
    throw new Error('Invalid truck or items provided');
  }
  
  if (truck.dimensions.length <= 0 || truck.dimensions.width <= 0 || truck.dimensions.height <= 0) {
    throw new Error('Invalid truck dimensions');
  }
  
  const placedItems: PlacedItem[] = [];
  const unplacedItems: Item[] = [];
  
  const flatList: Item[] = [];
  itemsToPack.forEach(item => {
    if (!item.dimensions || item.dimensions.length <= 0 || item.dimensions.width <= 0 || item.dimensions.height <= 0) {
      return;
    }
    const quantity = Math.max(1, item.quantity || 1);
    for (let i = 0; i < quantity; i++) {
      flatList.push({ ...item, weight: item.weight || 50 }); // Default weight to 50kg if missing
    }
  });

  // Sort items for optimal safety and space:
  // 1. Heavy items first (to keep CoG low)
  // 2. Non-fragile items before fragile items (fragile on top)
  // 3. Large volume before small volume
  flatList.sort((a, b) => {
    // Fragility check: Non-fragile items should be placed first (bottom)
    if (a.isFragile !== b.isFragile) {
      return a.isFragile ? 1 : -1;
    }

    // Weight check: Heavy items should be placed first (bottom)
    const wA = a.weight || 0;
    const wB = b.weight || 0;
    if (Math.abs(wB - wA) > 0.1) return wB - wA;
    
    // Volume check
    const volA = a.dimensions.length * a.dimensions.width * a.dimensions.height;
    const volB = b.dimensions.length * b.dimensions.width * b.dimensions.height;
    return volB - volA;
  });

  const fitsAt = (
    item: Item,
    pos: { x: number; y: number; z: number },
    placed: PlacedItem[],
    truckDims: { l: number; w: number; h: number }
  ): boolean => {
    const dims = { l: item.dimensions.length, w: item.dimensions.width, h: item.dimensions.height };
    
    if (pos.x + dims.l > truckDims.l) return false;
    if (pos.y + dims.h > truckDims.h) return false;
    if (pos.z + dims.w > truckDims.w) return false;

    // Safety: If placing above the floor (y > 0), ensure there is stable support underneath
    if (pos.y > 0) {
      let supportedArea = 0;
      const totalArea = dims.l * dims.w;

      for (const other of placed) {
        // Check if other is directly underneath
        const isUnderneath = Math.abs(pos.y - (other.position[1] + other.dimensions.height)) < 0.1;
        if (isUnderneath) {
          const overlapL = Math.min(pos.x + dims.l, other.position[0] + other.dimensions.length) - Math.max(pos.x, other.position[0]);
          const overlapW = Math.min(pos.z + dims.w, other.position[2] + other.dimensions.width) - Math.max(pos.z, other.position[2]);

          if (overlapL > 0 && overlapW > 0) {
            // If the item below is NOT stackable, we cannot place anything on it
            if (other.isStackable === false) {
              return false;
            }
            supportedArea += overlapL * overlapW;
          }
        }
      }

      // Enforce that at least 70% of the bottom surface area is supported by stackable items underneath
      if (supportedArea < totalArea * 0.70) {
        return false;
      }
    }

    for (const other of placed) {
      const intersectX = pos.x < other.position[0] + other.dimensions.length && pos.x + dims.l > other.position[0];
      const intersectY = pos.y < other.position[1] + other.dimensions.height && pos.y + dims.h > other.position[1];
      const intersectZ = pos.z < other.position[2] + other.dimensions.width && pos.z + dims.w > other.position[2];

      if (intersectX && intersectY && intersectZ) return false;
    }
    return true;
  };

  const truckL = truck.dimensions.length;
  const truckW = truck.dimensions.width;
  const truckH = truck.dimensions.height;
  
  let currentTotalWeight = 0;

  for (const item of flatList) {
    // Check truck weight limit
    if (currentTotalWeight + (item.weight || 0) > truck.maxWeight) {
      unplacedItems.push(item);
      continue;
    }

    let placed = false;
    const dim = { l: item.dimensions.length, w: item.dimensions.width, h: item.dimensions.height };

    const potentialPoints: { x: number, y: number, z: number }[] = [{ x: 0, y: 0, z: 0 }];
    
    placedItems.forEach(p => {
      potentialPoints.push({ x: p.position[0] + p.dimensions.length, y: p.position[1], z: p.position[2] }); // Right
      potentialPoints.push({ x: p.position[0], y: p.position[1] + p.dimensions.height, z: p.position[2] }); // Top
      potentialPoints.push({ x: p.position[0], y: p.position[1], z: p.position[2] + p.dimensions.width }); // Front
    });

    // Strategy: Prefer Bottom (lowest Y), then distribute evenly across axles (X), then Z.
    // For axle distribution, we want X to alternate or spread out to keep CoG near center X.
    const centerZ = truckW / 2;

    potentialPoints.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y; // Lowest first (Stability: low CoG)
      
      // Lengthwise (X): Pack starting from the MIDDLE of the deck (Center of Gravity) outward
      // This is the standard procedure for aircraft to keep the CoG centered above the wings
      const middleX = truckL / 2;
      const distToMiddleA = Math.abs(a.x + dim.l / 2 - middleX);
      const distToMiddleB = Math.abs(b.x + dim.l / 2 - middleX);
      if (Math.abs(distToMiddleA - distToMiddleB) > 5) return distToMiddleA - distToMiddleB;
      
      // Lateral (Z): Maintain side-to-side balance by staying near center of width
      const distToCenterA = Math.abs((a.z + dim.w / 2) - centerZ);
      const distToCenterB = Math.abs((b.z + dim.w / 2) - centerZ);
      return distToCenterA - distToCenterB;
    });

    for (const pt of potentialPoints) {
        if (fitsAt(item, pt, placedItems, { l: truckL, w: truckW, h: truckH })) {
            placedItems.push({
                ...item,
                uuid: Math.random().toString(36).substr(2, 9),
                position: [pt.x, pt.y, pt.z],
                rotation: [0, 0, 0],
                quantity: 1
            });
            currentTotalWeight += (item.weight || 0);
            placed = true;
            break;
        }
    }

    if (!placed) {
      unplacedItems.push(item);
    }
  }

  // Calculate volume stats
  const totalTruckVol = truckL * truckW * truckH;
  const usedVol = placedItems.reduce((acc, item) => acc + (item.dimensions.length * item.dimensions.width * item.dimensions.height), 0);

  // Calculate Center of Gravity
  let sumWeightX = 0;
  let sumWeightY = 0;
  let sumWeightZ = 0;
  
  placedItems.forEach(item => {
    const w = item.weight || 50;
    // item center
    const cx = item.position[0] + item.dimensions.length / 2;
    const cy = item.position[1] + item.dimensions.height / 2;
    const cz = item.position[2] + item.dimensions.width / 2;
    
    sumWeightX += cx * w;
    sumWeightY += cy * w;
    sumWeightZ += cz * w;
  });

  const centerOfGravity = currentTotalWeight > 0 ? {
    x: sumWeightX / currentTotalWeight,
    y: sumWeightY / currentTotalWeight,
    z: sumWeightZ / currentTotalWeight
  } : { x: truckL / 2, y: 0, z: truckW / 2 };

  return {
    truckId: truck.id,
    placedItems,
    unplacedItems,
    volumeUtilization: (usedVol / totalTruckVol) * 100,
    weightUtilization: (currentTotalWeight / truck.maxWeight) * 100,
    centerOfGravity,
    totalWeight: currentTotalWeight
  };
};