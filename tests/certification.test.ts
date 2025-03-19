import { describe, it, expect, beforeEach } from "vitest"
import { mockClarity } from "./helpers/mock-clarity"

// Mock the Clarity environment
const clarity = mockClarity()

describe("Certification Contract", () => {
  beforeEach(() => {
    // Reset contract state before each test
    clarity.reset()
  })
  
  it("should register a certifier", async () => {
    const result = await clarity.executeContract({
      contract: "certification",
      method: "register-certifier",
      sender: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5", // Contract owner
      args: [
        { type: "principal", value: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG" },
        { type: "string-utf8", value: "Organic Craft Certifiers" },
        {
          type: "list",
          value: [
            { type: "string-utf8", value: "organic" },
            { type: "string-utf8", value: "non-gmo" },
            { type: "string-utf8", value: "craft" },
          ],
        },
      ],
    })
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual({ type: "ok", value: { type: "bool", value: true } })
  })
  
  it("should issue a certification", async () => {
    // First register a certifier
    await clarity.executeContract({
      contract: "certification",
      method: "register-certifier",
      sender: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5", // Contract owner
      args: [
        { type: "principal", value: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG" },
        { type: "string-utf8", value: "Organic Craft Certifiers" },
        {
          type: "list",
          value: [
            { type: "string-utf8", value: "organic" },
            { type: "string-utf8", value: "non-gmo" },
            { type: "string-utf8", value: "craft" },
          ],
        },
      ],
    })
    
    // Then issue a certification
    const result = await clarity.executeContract({
      contract: "certification",
      method: "issue-certification",
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", // The certifier
      args: [
        { type: "uint", value: 1 }, // Batch ID
        { type: "string-utf8", value: "organic" },
        { type: "uint", value: 100000 }, // Expiration block height
        { type: "string-utf8", value: "All ingredients verified organic" },
      ],
    })
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual({ type: "ok", value: { type: "bool", value: true } })
  })
  
  it("should check if a batch is certified", async () => {
    // First register a certifier
    await clarity.executeContract({
      contract: "certification",
      method: "register-certifier",
      sender: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5", // Contract owner
      args: [
        { type: "principal", value: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG" },
        { type: "string-utf8", value: "Organic Craft Certifiers" },
        {
          type: "list",
          value: [
            { type: "string-utf8", value: "organic" },
            { type: "string-utf8", value: "non-gmo" },
            { type: "string-utf8", value: "craft" },
          ],
        },
      ],
    })
    
    // Then issue a certification
    await clarity.executeContract({
      contract: "certification",
      method: "issue-certification",
      sender: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", // The certifier
      args: [
        { type: "uint", value: 1 }, // Batch ID
        { type: "string-utf8", value: "organic" },
        { type: "uint", value: 100000 }, // Expiration block height
        { type: "string-utf8", value: "All ingredients verified organic" },
      ],
    })
    
    // Check if the batch is certified
    const result = await clarity.executeContract({
      contract: "certification",
      method: "is-certified",
      args: [
        { type: "uint", value: 1 }, // Batch ID
        { type: "string-utf8", value: "organic" },
      ],
    })
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual({ type: "bool", value: true })
  })
})

