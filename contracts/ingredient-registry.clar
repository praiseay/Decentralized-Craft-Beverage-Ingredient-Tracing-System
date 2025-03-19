;; Ingredient Registry Contract
;; Records sources of hops, grains, and other inputs

(define-data-var last-id uint u0)

(define-map ingredients
  { id: uint }
  {
    name: (string-utf8 100),
    supplier: (string-utf8 100),
    origin: (string-utf8 100),
    harvest-date: uint,
    ingredient-type: (string-utf8 50),
    registered-by: principal
  }
)

(define-read-only (get-ingredient (id uint))
  (map-get? ingredients { id: id })
)

(define-read-only (get-last-id)
  (var-get last-id)
)

(define-public (register-ingredient
    (name (string-utf8 100))
    (supplier (string-utf8 100))
    (origin (string-utf8 100))
    (harvest-date uint)
    (ingredient-type (string-utf8 50))
  )
  (let
    (
      (new-id (+ (var-get last-id) u1))
    )
    (var-set last-id new-id)
    (map-set ingredients
      { id: new-id }
      {
        name: name,
        supplier: supplier,
        origin: origin,
        harvest-date: harvest-date,
        ingredient-type: ingredient-type,
        registered-by: tx-sender
      }
    )
    (ok new-id)
  )
)

