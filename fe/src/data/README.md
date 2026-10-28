# Vietnamese administrative units

`vietnamAdministrativeUnits.json` contains the 34 province-level units and 3,321 commune-level units from [Vietnamese Provinces Database v5.1.0](https://github.com/thanglequoc/vietnamese-provinces-database/releases/tag/v5.1.0), using only official unit codes and Vietnamese names. Source license: MIT, copyright (c) 2021 Thang Le Quoc; see `SOURCE-LICENSE.txt`.

`hcmInnerWardCodes.json` and `be/src/main/resources/hcm-inner-ward-codes.txt` contain the same 78 codes. They map current HCM wards to the former inner-city shipping zone (35,000 VND). The mapping was derived from [undertheseanlp/address](https://huggingface.co/undertheseanlp/address) (Apache-2.0) and the existing district fee policy. Other wards and provinces cost 70,000 VND. Wards spanning former inner and outer districts are classified by their current ward type (`Phường` as inner, `Xã` as outer), so a boundary address may need manual review by the seller.

The two code files must be updated together when the administrative dataset changes.
