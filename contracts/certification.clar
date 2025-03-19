;; Certification Contract
;; Verifies organic, local, or specialty designations

(define-constant contract-owner tx-sender)

(define-map certifiers
  { address: principal }
  {
    name: (string-utf8 100),
    certification-types: (list 10 (string-utf8 50)),
    active: bool
  }
)

(define-map certifications
  { batch-id: uint, cert-type: (string-utf8 50) }
  {
    certifier: principal,
    timestamp: uint,
    expiration: uint,
    details: (string-utf8 200)
  }
)

(define-read-only (get-certifier (address principal))
  (map-get? certifiers { address: address })
)

(define-read-only (get-certification (batch-id uint) (cert-type (string-utf8 50)))
  (map-get? certifications { batch-id: batch-id, cert-type: cert-type })
)

(define-read-only (is-certified (batch-id uint) (cert-type (string-utf8 50)))
  (match (get-certification batch-id cert-type)
    certification (< block-height (get expiration certification))
    false
  )
)

(define-public (register-certifier
    (certifier principal)
    (name (string-utf8 100))
    (certification-types (list 10 (string-utf8 50)))
  )
  (begin
    ;; Only contract owner can register certifiers
    (asserts! (is-eq tx-sender contract-owner) (err u1))

    (map-set certifiers
      { address: certifier }
      {
        name: name,
        certification-types: certification-types,
        active: true
      }
    )
    (ok true)
  )
)

(define-public (issue-certification
    (batch-id uint)
    (cert-type (string-utf8 50))
    (expiration uint)
    (details (string-utf8 200))
  )
  (let
    (
      (certifier-info (unwrap! (get-certifier tx-sender) (err u1)))
    )
    ;; Check if certifier is active
    (asserts! (get active certifier-info) (err u2))

    ;; Check if certifier can issue this type of certification
    (asserts! (is-some (index-of (get certification-types certifier-info) cert-type)) (err u3))

    (map-set certifications
      { batch-id: batch-id, cert-type: cert-type }
      {
        certifier: tx-sender,
        timestamp: block-height,
        expiration: expiration,
        details: details
      }
    )
    (ok true)
  )
)

(define-public (revoke-certification
    (batch-id uint)
    (cert-type (string-utf8 50))
  )
  (let
    (
      (certification (unwrap! (get-certification batch-id cert-type) (err u1)))
    )
    ;; Only the original certifier or contract owner can revoke
    (asserts! (or (is-eq tx-sender (get certifier certification))
                 (is-eq tx-sender contract-owner))
             (err u2))

    (map-set certifications
      { batch-id: batch-id, cert-type: cert-type }
      (merge certification { expiration: block-height })
    )
    (ok true)
  )
)

