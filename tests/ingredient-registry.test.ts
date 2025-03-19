import { describe, it, expect, beforeEach } from "vitest"
import { mockClarity } from "./helpers/mock-clarity"

// Mock the Clarity environment
const clarity = mockClarity()

describe("Ingredient Registry Contract", () => {
  beforeEach(() => {
    // Reset contract state before each test
    clarity.reset()
  })
  
  it("should register a new ingredient", async () => {
    const result = await clarity.executeContract({
      contract: "ingredient-registry",
      method: "register-ingredient",
      sender: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
      args: [
        { type: "string-utf8", value: "Cascade Hops" },
        { type: "string-utf8", value: "Pacific Northwest Hops" },
        { type: "string-utf8", value: "Yakima Valley, WA" },
        { type: "uint", value: 20230915 },
        { type: "string-utf8", value: "hops" },
      ],
    })
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual({ type: "ok", value: { type: "uint", value: 1 } })
  })
  
  it("should retrieve a registered ingredient", async () => {
    // First register an ingredient
    await clarity.executeContract({
      contract: "ingredient-registry",
      method: "register-ingredient",
      sender: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
      args: [
        { type: "string-utf8", value: "Cascade Hops" },
        { type: "string-utf8", value: "Pacific Northwest Hops" },
        { type: "string-utf8", value: "Yakima Valley, WA" },
        { type: "uint", value: 20230915 },
        { type: "string-utf8", value: "hops" },
      ],
    })
    
    // Then retrieve it
    const result = await clarity.executeContract({
      contract: "ingredient-registry",
      method: "get-ingredient",
      args: [{ type: "uint", value: 1 }],
    })
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      type: "some",
      value: {
        name: { type: "string-utf8", value: "Cascade Hops" },
        supplier: { type: "string-utf8", value: "Pacific Northwest Hops" },
        origin: { type: "string-utf8", value: "Yakima Valley, WA" },
        "harvest-date": { type: "uint", value: 20230915 },
        "ingredient-type": { type: "string-utf8", value: "hops" },
        "registered-by": { type: "principal", value: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5" },
      },
    })
  })
})

